# frozen_string_literal: true

module AccessProfile
  class TagsController < ::AjaxController
    before_action :restrict_access
    authorization_context 'access_profile'
    authorization_required

    module Action
      TAG_CREATE = 1
      TAG_DESTROY = 2
    end

    # Returns project tags relevant to access profiles
    # tags are filtered with the configuration file provided
    def index
      tags = cloud_admin.identity.list_tags(@scoped_project_id)
      render json: { tags: filter_tags(tags) }
    rescue Elektron::Errors::ApiResponse => e
      puts 'error elektron'
      render json: { errors: e.message }, status: e.code
    rescue Exception => e
      render json: { errors: e.message }, status: '500'
    end

    def create
      tag = params[:tag]
      tags = cloud_admin.identity.list_tags(@scoped_project_id)
      ok, err = validate_tag(tag, filter_tags(tags), Action::TAG_CREATE)
      return render json: { errors: err, tagSpec: GalvaniConfig['access_profiles'] }, status: 422 unless ok

      # ensure base prefix/tag is also added
      ok, err = ensure_base_prefix(tag, filter_tags(tags), Action::TAG_CREATE)
      return render json: { errors: err }, status: 422 unless ok

      cloud_admin.identity.add_single_tag(@scoped_project_id, tag)
      audit_logger.info(current_user, 'has created tag', tag)
      render json: { tag: tag }
    rescue Elektron::Errors::ApiResponse => e
      render json: { errors: e.message }, status: e.code
    rescue Exception => e
      render json: { errors: e.message }, status: '500'
    end

    def destroy
      tag = params[:id]
      tags = cloud_admin.identity.list_tags(@scoped_project_id)
      ok, err = validate_tag(tag, filter_tags(tags), Action::TAG_DESTROY)
      return render json: { errors: err, tagSpec: GalvaniConfig['access_profiles'] }, status: 422 unless ok

      # ensure base prefix/tag is also removed
      ok, err = ensure_base_prefix(tag, filter_tags(tags), Action::TAG_DESTROY)
      return render json: { errors: err }, status: 422 unless ok

      cloud_admin.identity.remove_single_tag(@scoped_project_id, tag)
      audit_logger.info(current_user, 'has deleted tag', tag)
      render json: { tag: tag }
    rescue Elektron::Errors::ApiResponse => e
      render json: { errors: e.message }, status: e.code
    rescue Exception => e
      render json: { errors: e.message }, status: '500'
    end

    def profiles_config
      render json: { config: GalvaniConfig['access_profiles'] }
    rescue Exception => e
      render json: { errors: e.message }, status: '500'
    end

    private

    # return all access profile tags --> prefixes from config file xs:internet, ...
    # the base prefixes should be removed
    def filter_tags(tags)
      return [] if tags.blank?

      profile_prefixes = GalvaniConfig['access_profiles'].keys || []
      # array with splat operator(*), select returns a new array
      tags.select { |n| n.start_with?(*profile_prefixes) }
    end

    # add base prefix/tag to the tags list when a new tag from this base is added
    # remove base prefix/tag when last tag from this base is removed
    # base prefix/tag is being used to filter in the openstack api
    def ensure_base_prefix(tag, existing_tags, action)
      # get base prefix
      base_prefix = base_prefix(tag)
      return false, 'no base access profile found' if base_prefix.blank?

      case action
      when Action::TAG_CREATE
        # check if the prefix is already added as tag
        unless existing_tags.include?(base_prefix)
          begin
            cloud_admin.identity.add_single_tag(@scoped_project_id, base_prefix)
          rescue Exception => e
            return false, "Error create base access profile. #{e.message}"
          end
        end
      when Action::TAG_DESTROY
        # check if there is more tags with the same base_prefix
        # search for tags with "base_prefix" with ":" so not base prefixes can't be matched
        if existing_tags.grep(/#{base_prefix}:/).count == 1 && existing_tags.include?(tag)
          begin
            cloud_admin.identity.remove_single_tag(@scoped_project_id, base_prefix)
          rescue Exception => e
            return false, "Error removing base access profile. #{e.message}"
          end
        end
      end
      [true, '']
    end

    # validate that tag
    def validate_tag(tag, existing_tags, action)
      # check for empty tags
      return false, 'access profile is empty!' if tag.blank?

      # get base prefix
      base_prefix = base_prefix(tag)
      return false, 'no base access profile found' if base_prefix.blank?

      # get the sercice
      services = GalvaniConfig['access_profiles'][base_prefix].keys.select do |k|
        # service is everyting until the arguments $1, $2...
        serviceKey = k.split(':$').first
        tag.start_with?(base_prefix + ':' + serviceKey)
      end

      return false, 'no service found' if services.blank?

      service = services[0]
      # get the service args
      service_name_args = service.split(':$')
      service_name = service_name_args.shift
      service_args = service_name_args
      # get the tag arguments
      tag_args_str = tag.split(base_prefix + ':' + service_name + ':')[1] || ''
      tag_args = tag_args_str.split(':')

      # check for required args from the config
      return false, 'provided arguments mismatch' if service_args.length != tag_args.length

      if action == Action::TAG_CREATE && existing_tags.include?(tag)
        # check for duplicates when creating new tags
        return false, 'access profile already exists'
      end

      [true, '']
    end

    # returns base prefix if found
    def base_prefix(tag)
      return '' if tag.blank?

      # get base prefix
      base_prefixes = GalvaniConfig['access_profiles'].keys.select do |n|
        tag.start_with?(n)
      end

      return '' if base_prefixes.blank?

      base_prefixes[0]
    end

    def restrict_access
      # just for production regions
      return if current_region.start_with?('qa-')
      # if user hasn't the cloud_support_tools_viewer should be redirected
      return if current_user.has_role?('cloud_support_tools_viewer')

      @access_error = 'You are not allowed to see this page.'
      render status: :unauthorized
    end
  end
end

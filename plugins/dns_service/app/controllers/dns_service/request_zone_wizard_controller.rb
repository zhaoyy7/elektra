# frozen_string_literal: true

module DnsService
  # Implements Zone Requests
  class RequestZoneWizardController < ::DashboardController
    include CreateZonesHelper
    
    def new
      
      @zone_request = ::DnsService::ZoneRequest.new(nil)
      @pools = cloud_admin.dns_service.pools[:items]

      @zone_resource = get_zone_resource
      @recordset_resource = get_recordset_resource

      # this needs to be removed when migration is done
      @pools.reject!{|pool| pool.attributes["attributes"]["label"] == "New External SAP Hosted Zone" }

    end

    def create
      @zone_request = ::DnsService::ZoneRequest.new(nil, params[:zone_request])
      inquiry = nil

      if @zone_request.valid?
        begin
          dns_admins = list_ccadmin_master_dns_admins

          cloud_admin_domain_friendly_id = @cloud_admin_domain.friendly_id || @cloud_admin_domain.name
          master_project_friendly_id = @master_project.friendly_id || @master_project.name

          inquiry = services.inquiry.create_inquiry(
            'zone',
            "#{@zone_request.zone_name} - #{@zone_request.description}",
            current_user,
            @zone_request.attributes.delete_if{|k,v| k=='id'}.to_json,
            dns_admins,
            {
                "approved": {
                    "name": "Approve",
                    "action": "#{plugin('identity').domain_url(host: request.host_with_port, protocol: request.protocol, domain_id: cloud_admin_domain_friendly_id, project_id: nil)}?overlay=#{plugin('dns_service').create_zone_wizard_path(domain_id: cloud_admin_domain_friendly_id,project_id: master_project_friendly_id)}"
                }
            },
            @scoped_domain_id, # requester domain
            {
                domain_name: @scoped_domain_name,
                region: current_region
            },
            @cloud_admin_domain.id # approver domain
          )
          unless inquiry.errors.empty?
            inquiry.errors.each{|k,m| @zone_request.errors.add(k,m)}
          end
        rescue => e
          @zone_request.errors.add("message",e.message)
        end
      end

      if @zone_request.errors.empty?
        flash.now[:notice] = 'Zone request successfully created'
        audit_logger.info(current_user, "has requested zone #{@zone_request.attributes}")
        render template: 'dns_service/request_zone_wizard/create.js'
      else
        @pools = cloud_admin.dns_service.pools[:items]
        @zone_resource = get_zone_resource
        @recordset_resource = get_recordset_resource
        render action: :new
      end
    end

    protected

    def list_ccadmin_master_dns_admins
      cloud_dns_admin_role = cloud_admin.identity
                                        .find_role_by_name('cloud_dns_admin')

      @cloud_admin_domain = cloud_admin.identity.domains(
        name: Rails.configuration.cloud_admin_domain
      ).first
      return [] unless @cloud_admin_domain
      @master_project = cloud_admin.identity.projects(
        name: 'master', domain_id: @cloud_admin_domain.id
      ).first
      return [] unless @master_project

      role_assignments = cloud_admin.identity.role_assignments(
        'scope.project.id' => @master_project.id,
        'role.id' => cloud_dns_admin_role.id,
        effective: true,
        include_subtree: true
      )

      user_ids = role_assignments.collect { |ra| ra.user['id'] }.uniq
      # load users (not very performant but there is no other
      # option to get users by ids)
      user_ids.each_with_object([]) do |id, admins|
        next if id == Rails.application.config.service_user_id
        admin = cloud_admin.identity.find_user(id)
        admins << admin if admin
      end
    end
  end
end

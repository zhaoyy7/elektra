module ObjectStorage
  class FoldersController < ApplicationController

    authorization_required
    before_filter :load_params

    def new_object
      @form = ObjectStorage::Forms::CreateObject.new(file: nil, name: '')
    end

    def create_object
      @form = ObjectStorage::Forms::CreateObject.new(params.require(:forms_create_object))
      @form.name = @form.file.original_filename if @form.file and not @form.name
      unless @form.validate
        render action: 'new_object'
        return
      end

      services.object_storage.create_object(@container_name, @object.path + @form.name, @form.file)

      respond_to do |format|
        format.js
        format.html { redirect_to plugin('object_storage').list_objects_path(@container_name, @object.path) }
      end
    end

    def new_folder
      @form = ObjectStorage::Forms::CreateFolder.new(name: '')
    end

    def create_folder
      @form = ObjectStorage::Forms::CreateFolder.new(params.require(:forms_create_folder))
      unless @form.validate
        render action: 'new_folder'
        return
      end

      services.object_storage.create_folder(@container_name, @object.path + @form.name)

      respond_to do |format|
        format.js
        format.html { redirect_to plugin('object_storage').list_objects_path(@container_name, @object.path) }
      end
    end

    private

    def load_params
      # do not load the whole container object as it is not needed usually
      @container_name = params[:container]

      # params[:path] is optional to account for the "/" path (which Rails
      # routing recognizes as empty), but then it is given as nil
      params[:path] ||= ''

      # we want to use the helper methods on ObjectStorage::Object, but the
      # folder identified by params[:path] need not necessarily exist as an
      # object (i.e. find_object() might fail with 404)
      params[:path] += '/' unless params[:path].end_with?('/')
      @object = ObjectStorage::Object.new(nil, id: params[:path])
    end

  end
end

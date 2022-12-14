module EmailService
  class Forms::TemplatedEmail

    include Virtus.model
    extend ActiveModel::Naming
    include ActiveModel::Conversion
    include ActiveModel::Validations
    include ActiveModel::Validations::Callbacks
    include ::EmailService::Helpers

    attribute :source_type, String
    attribute :source, String
    attribute :source_email, String
    attribute :source_domain, String
    attribute :source_domain_name_part, String

    attribute :to_addr, String
    attribute :cc_addr, String
    attribute :bcc_addr, String
    attribute :reply_to_addr, String
    attribute :return_path, String
    attribute :template_name, String
    attribute :template_data, String
    attribute :tags, Array
    attribute :configuration_set_name, String

    strip_attributes

    # validation
    validates_presence_of :source, message: "Sender can't be empty"
    validates_presence_of :template_name, message: "Template name can't be empty"
    validates_presence_of :to_addr, message: "To address can't be empty"
    validates_presence_of :template_data, message: "Template data can't be empty"
    validates_presence_of :tags, message: "Atleast one tag [{\"name\": \"Name\", {\"value\": \"Value\"}] is needed"

    validates :to_addr, presence: true, email: true
    validates :cc_addr, allow_nil: true, email: true
    validates :bcc_addr, allow_nil: true, email: true
    validates :template_data, presence: true, json: true


    def to_model
      self
    end

    def persisted?
      false
    end

    def process(templated_email_instance)
      process!(templated_email_instance)
    end

    private

    def process!(templated_email_instance)
      templated_email = templated_email_instance.new
      begin
        templated_email.form_to_attributes(attributes)
      rescue JSON::ParserError => e
        errors.add 'templated_email_attributes'.to_sym, e.inspect
      end
      if !templated_email.errors.blank?
        messages = templated_email.errors.blank? ? {} : templated_email.errors
        assign_errors(messages)
      end
      templated_email
    end


    def assign_errors(messages)
      messages.each do |key, value|
        value.each do |item|
          errors.add key.to_sym, item
        end
      end
    end

  end
end

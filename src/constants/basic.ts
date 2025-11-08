import appConfig from "../../app-config.json";

export const statusBarColor = {
  primary: appConfig.template.primaryColor || appConfig.app.statusBarColor,
  secondary: "#FFFFFF",
};

export const textStatusBarColor = {
  primary: appConfig.app.textColor,
  secondary: "black",
};

export const MESSAGE_TYPES = {
	TEXT: 'text',
	INVITATION: 'invitation',
	REQUEST: 'request',
	REQUEST_ACCEPTED: 'request_accepted',
	REQUEST_REJECTED: 'request_rejected',
	REQUEST_CANCELLED: 'request_cancelled',
	INVITATION_ACCEPTED: 'invitation_accepted',
	INVITATION_REJECTED: 'invitation_rejected',
	INVITATION_CANCELLED: 'invitation_cancelled',
	ROOMMATE_APPLICATION: 'roommate_application',
	ROOMMATE_APPLICATION_APPROVED: 'roommate_application_approved',
	ROOMMATE_APPLICATION_REJECTED: 'roommate_application_rejected',
	ROOMMATE_APPLICATION_CANCELLED: 'roommate_application_cancelled',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

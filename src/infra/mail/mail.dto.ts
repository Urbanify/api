export type SendMailDto = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

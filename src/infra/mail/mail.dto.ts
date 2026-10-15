export enum TokenAction {
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export type SendMailDto = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export enum TokenAction {
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export type SendMailDto = {
  to: string;
  subject: string;
  template: string;
  payload: any;
};

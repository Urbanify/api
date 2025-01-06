export const templates = {
  'reset-password': buildResetPasswordHTML,
};

function buildResetPasswordHTML(payload: any) {
  return `
  <h1>Clique no <a href="${payload.link}">link</a> para resetar sua senha</h1>
  `;
}

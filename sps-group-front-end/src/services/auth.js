export const obterAutenticacao = () => localStorage.getItem('token') !== null
export const obterToken = () => localStorage.getItem('token')
export const obterUsuario = () => JSON.parse(localStorage.getItem('usuario'))
export const entrar = (token) => {
  localStorage.setItem('token', token);
}
export const sair = () => localStorage.clear()
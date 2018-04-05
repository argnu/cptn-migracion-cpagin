const matriculas = require('./matriculas');
module.exports.matriculas = matriculas;

const estados = require('./estados');
module.exports.estados = estados;

const posgrados = require('./posgrados');
module.exports.posgrados = posgrados;

const titulos = require('./titulos');
module.exports.titulos = titulos;

const beneficiarios = require('./beneficiarios');
module.exports.beneficiarios = beneficiarios;

const subsidiarios = require('./subsidiarios');
module.exports.subsidiarios = subsidiarios;

const empresas = require('./empresas');
module.exports.empresas = empresas;

const empresarepresentantes = require('./empresarepresentantes');
module.exports.empresarepresentantes = empresarepresentantes;

const empresaIncumbencias = require('./empresaIncumbencias');
module.exports.empresaIncumbencias = empresaIncumbencias;

 module.exports.migrar = function() {
  return estados.migrar()
         .then(r => matriculas.migrar())
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => beneficiarios.migrar())
         .then(r => subsidiarios.migrar())
         .then(r => empresas.migrar())
         .then(r => empresarepresentantes.migrar())
         .then(r => empresaIncumbencias.migrar())
 }

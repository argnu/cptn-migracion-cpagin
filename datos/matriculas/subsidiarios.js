const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

const addSubsidiario = (subsidiario) => {
  return model.Matricula.getMigracion(subsidiario['ID'])
  .then(matricula => {
    let nuevoSubsidiario = {};
    nuevoSubsidiario.profesional = matricula.entidad;
    nuevoSubsidiario.nombre = utils.checkString(subsidiario['NOMBRE']);
    nuevoSubsidiario.apellido = utils.checkString(subsidiario['APELLIDO']);
    nuevoSubsidiario.dni = utils.checkString(subsidiario['NUMDOCU']);
    nuevoSubsidiario.porcentaje = subsidiario['PORCENTAJE'];
    return model.Subsidiario.add(nuevoSubsidiario);
  });
}


module.exports.migrar = function() {
    console.log('Migrando subsidiarios de caja...');
    let q_objetos = `select s.ID, s.APELLIDO,
            s.NOMBRE, s.PORCENTAJE, s.NUMDOCU
            from MAT_SUBSIDIO s inner join MATRICULAS m
            on s.ID=m.ID
            where s.ID between @offset and @limit`;
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_SUBSIDIO';

    return utils.migrar(q_objetos, q_limites, 100, addSubsidiario);
}

const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


const addBeneficiario = (beneficiario) => {
  return model.Matricula.getMigracion(beneficiario['ID'])
  .then(matricula => {
    let nuevoBeneficiario = {
      profesional: matricula.entidad,
      apellido: utils.checkString(beneficiario['APELLIDO']),
      nombre: utils.checkString(beneficiario['NOMBRE']),
      vinculo: beneficiario['VINCULO'],
      dni: beneficiario['NUMDOCU'],
      fechaNacimiento: utils.getFecha(beneficiario['FECHANAC_DATE']),
      invalidez: beneficiario['INVALIDEZ']
    };
    return model.BeneficiarioCaja.add(nuevoBeneficiario);
  });
}


module.exports.migrar = function() {
    console.log('Migrando beneficiarios de matrículas...');
    let q_objetos = `select c.ID, ITEM, c.APELLIDO,
            c.NOMBRE, VINCULO, c.NUMDOCU, FECHANAC_DATE, INVALIDEZ
            from MAT_CAJA c inner join MATRICULAS m
            on c.ID=m.ID
            where c.ID between @offset and @limit`;
    let q_limites = 'select MIN(ID) as min, MAX(ID) as max from MAT_CAJA';

    return utils.migrar(q_objetos, q_limites, 100, addBeneficiario);
}

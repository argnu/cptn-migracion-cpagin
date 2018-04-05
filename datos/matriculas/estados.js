const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


const addEstadoMatricula = (estado) => {
    let table = model.TipoEstadoMatricula.table;
    let query = table.insert(
        table.id.value(estado['CODIGO']),
        table.valor.value(utils.checkString(estado['DESCRIPCION']))
    ).toQuery();

    return connector.execQuery(query);
}


module.exports.migrar = function() {
    console.log('Migrando estados de matrícula...');
    let q_objetos = 'select * from T_ESTADO_MAT WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from T_ESTADO_MAT';

    return utils.migrar(q_objetos, q_limites, 100, addEstadoMatricula);
}

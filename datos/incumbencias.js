const connector = require('../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../model');
const utils = require('../utils');

const addTipoIncumbencia = (delegacion)  => {
    let table = model.TipoIncumbencia.table;
    let query = table.insert(
                  table.id.value(delegacion['CODINCUMBENCIA']),
                  table.valor.value(utils.checkString(delegacion['NOMBREINCUMBENCIA'])),
                  table.acreditacomo.value(delegacion['ACREDITACOMO'])
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando incumbencias...');
    let q_objetos = 'select * from T_INCUMBENCIA WHERE CODINCUMBENCIA BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODINCUMBENCIA) as min, MAX(CODINCUMBENCIA) as max from T_INCUMBENCIA';

    return utils.migrar(q_objetos, q_limites, 100, addTipoIncumbencia);
}

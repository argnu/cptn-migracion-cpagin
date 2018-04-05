const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addIncumbencia(item) {
    return model.Matricula.getMigracion(item['IDEMP'], true)
        .then(matricula_empresa => {
            if (matricula_empresa) {
                let table = model.EmpresaIncumbencia.table;
                let query = table.insert(
                    table.empresa.value(matricula_empresa.entidad),
                    table.incumbencia.value(item['IDINC'])
                ).toQuery();
                return connector.execQuery(query);
            }
        })
}


module.exports.migrar = function () {
    console.log('Migrando incumbencias de empresas...');
    let q_objetos = ` SELECT *
                      FROM EMP_INCUMBENCIAS WHERE IDEMP BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(IDEMP) as min, MAX(IDEMP) as max from EMP_INCUMBENCIAS';

    return utils.migrar(q_objetos, q_limites, 100, addIncumbencia);
}

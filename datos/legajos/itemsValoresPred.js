const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

const addItem = (item)  => {
    let table = model.tareas.ItemValorPredeterminado.table;
    let id_item = `${item['CODIGOPREGUNTA']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
                  table.item.value(id_item),
                  table.valor.value(utils.checkString(item['DESCRIPCION']))
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items predeterminados de tareas...');
    let q_objetos = `select distinct t.CODIGOPREGUNTA, t.NUMEROPREGUNTA, r.DESCRIPCION
        FROM Tareas_N2_Respuestas t
        JOIN RespuestasTareas r
        ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)
        WHERE t.CODIGOPREGUNTA BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(t.CODIGOPREGUNTA) as min, MAX(t.CODIGOPREGUNTA) as max FROM Tareas_N2_Respuestas t
      JOIN RespuestasTareas r
      ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)`;

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}

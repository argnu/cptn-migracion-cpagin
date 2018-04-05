const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

const addItem = (item) => {
    let table = model.tareas.ItemPredeterminado.table;
    let id_item = `${item['CODIGOPREGUNTA']}${item['NUMEROPREGUNTA']}`;
    console.log(id_item, item['CODIGOTAREAN2'])
    let query = table.insert(
                  table.item.value(id_item),
                  table.subcategoria.value(item['CODIGOTAREAN2'])
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items predeterminados de tareas...');
    let q_objetos = `SELECT t.CODIGOPREGUNTA, t.NUMEROPREGUNTA, CODIGOTAREAN2
        FROM Tareas_N2_Preguntas t
        JOIN PreguntasTareas p ON (t.CODIGOPREGUNTA=p.CODIGO AND t.NUMEROPREGUNTA=p.NUMEROPREGUNTA)
        WHERE t.CODIGOPREGUNTA BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(CODIGOPREGUNTA) as min, MAX(CODIGOPREGUNTA) as max from Tareas_N2_Preguntas t
    JOIN PreguntasTareas p ON (t.CODIGOPREGUNTA=p.CODIGO AND t.NUMEROPREGUNTA=p.NUMEROPREGUNTA)`;

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}

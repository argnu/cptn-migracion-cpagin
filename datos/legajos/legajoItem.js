const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addLegajoItem(item) {
    return model.tareas.Legajo.getBySolicitud(item['IDSOLICITUD'])
        .then(legajo => {
            if (legajo) {   //PUEDE QUE EL LEGAJO NO EXISTA PORQUE LA MATRICULA NO EXISTIA
                let table = model.tareas.LegajoItem.table;
                let id_item = `${item['IDPREGUNTA']}${item['NumPregunta']}`;
                let query = table.insert(
                    table.legajo.value(legajo.id),
                    table.item.value(id_item),
                    table.valor.value(utils.checkString(item['valorRespuesta']))
                ).toQuery();

                return connector.execQuery(query);
            }
            else return Promise.resolve(null);
        });
}


module.exports.migrar = function () {
    console.log('Migrando Legajos Items...');
    let q_objetos = `  SELECT IDSOLICITUD, IDPREGUNTA, NumPregunta, LT.CODTAREAN2
                        ,valorRespuesta= CASE
                      WHEN (CODRTAALTERNATIVA IS NULL) THEN RT.DESCRIPCION
                      ELSE  CONVERT(varchar(200),CODRTAALTERNATIVA)
                      END
                      from LEGTECNICOS LT INNER JOIN RESPUESTASLT R ON (LT.ID_Solicitud=R.IDSOLICITUD)
                      LEFT JOIN RespuestasTareas RT ON
                      (RT.CODIGO = R.IDRESPUESTA AND
                       RT.NUMERORESPUESTA = R.NumRespuesta)
                       WHERE IDSOLICITUD BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(IDSOLICITUD) as min, MAX(IDSOLICITUD) as max from RESPUESTASLT';

    return utils.migrar(q_objetos, q_limites, 100, addLegajoItem);



}

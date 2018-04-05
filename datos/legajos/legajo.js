const connector = require(`../../../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`../../../../model`);
const utils = require(`../../utils`);

function prepare(legajo) {
let nuevo = legajo;
for(let att in legajo) {
    if (typeof legajo[att] == 'string')
        nuevo[att] = legajo[att].replace(/\0/g, "")
}
return nuevo;
}

function addComitente(legajo) {
    if (legajo['IDEMPRESA']) {
        return model.Persona.getByCuit(legajo['CUIT_EMPRESA'])
        .then(persona_juridica => {
            if (persona_juridica) return Promise.resolve(persona_juridica);
            else {
                return model.Persona.add({
                    tipo: 'juridica',
                    nombre: utils.checkString(legajo['NOMBRE_EMPRESA']),
                    cuit: utils.checkString(legajo['CUIT_EMPRESA']),
                    telefono: utils.checkString(legajo['TELEFONOCOMITENTE'])
                })
            }
        })
        .then(persona_juridica => model.tareas.LegajoComitente.add({
            legajo: legajo['id'],
            persona: persona_juridica.id,
            porcentaje: 100
        }))
    }
    else {
        return model.PersonaFisica.getByDni(legajo['NUMDOC'])
        .then(persona_fisica => {
            if (persona_fisica) return Promise.resolve(persona_fisica);
            else {
                return model.Persona.add({
                    tipo: 'fisica',
                    nombre: utils.checkString(legajo['NOMBRES']),
                    cuit: utils.checkString(legajo['NUMDOC']),
                    dni: utils.checkString(legajo['NUMDOC']),
                    apellido: utils.checkString(legajo['APELLIDO']),
                    telefono: utils.checkString(legajo['TELEFONOCOMITENTE'])
                })
            }
        })
        .then(persona_fisica => model.tareas.LegajoComitente.add({
            legajo: legajo['id'],
            persona: persona_fisica.id,
            porcentaje: 100
        }))
    }
}


function addDomicilio(legajo) {
    if (legajo['CIUDAD'] && legajo['DIRECCION']) {
        return model.Domicilio.add({
            localidad: legajo['CIUDAD'],
            calle: legajo['DIRECCION'],
            numero: 0
        }).then(d => d.id);
    }
    else return Promise.resolve(null);
}

function addLegajo(legajo_1) {
    let legajo = prepare(legajo_1);
    return model.Matricula.getMigracion(legajo['IDMATRICULADO'], legajo['MATRICEMP'] == 'E')
        .then(matricula => {
          if (matricula) {
            addDomicilio(legajo)
            .then(id_domicilio => {
                let table = model.tareas.Legajo.table;
                let query = table.insert(
                    table.solicitud.value(legajo['ID_Solicitud']),
                    table.numero_legajo.value(legajo['NROLEGAJO']),
                    table.tipo.value(legajo['TIPO']),
                    table.matricula.value(matricula.id),
                    table.fecha_solicitud.value(utils.getFecha(legajo['FECHASOLICITUD_DATE'])),
                    table.domicilio.value(id_domicilio),
                    table.nomenclatura.value(utils.checkString(legajo['NOMENCLATURA'])),
                    table.estado.value(legajo['ESTADO'] == 2 ? 1 : legajo['ESTADO']),
                    table.subcategoria.value(legajo['codTarea']),
                    table.incumbencia.value(legajo['INCUMBENCIAS']),
                    table.honorarios_presupuestados.value(legajo['HONORARIOSPRESUPUESTADOS']),
                    table.forma_pago.value(legajo['FORMAPAGO']),
                    table.plazo_cumplimiento.value(utils.getFecha(legajo['PLAZOCUMPLIMIENTOENCOMIENDA_DATE'])),
                    table.honorarios_reales.value(legajo['HONORARIOSREALES']),
                    table.porcentaje_cumplimiento.value(legajo['PORCENTAJECUMPLIMIENTO']),
                    table.finalizacion_tarea.value(utils.getFecha(legajo['FINALIZACIONTAREA_DATE'])),
                    table.tarea_publica.value(legajo['TAREAPUBLICA'] === 'SI' ? true : false),
                    table.dependencia.value(legajo['DEPENDENCIA'] === 1 ? true : false),
                    table.aporte_bruto.value(legajo['APORTEBRUTO']),
                    table.aporte_neto.value(legajo['APORTENETO']),
                    table.aporte_neto_bonificacion.value(legajo['APORTENETOBONIFPORAPORTEENTERMINO']),
                    table.cantidad_planos.value(legajo['CANTIDADPLANOS']),
                    table.observaciones.value(utils.checkString(legajo['OBSERVACIONES'])),
                    table.observaciones_internas.value(utils.checkString(legajo['OBSERVACIONESINTERNAS'])),
                    table.informacion_adicional.value(utils.checkString(legajo['INFOADICIONAL'])),
                    table.evaluador.value(utils.checkString(legajo['EVALUADOR'])),
                    table.delegacion.value(legajo['CodDelegacion'] ? legajo['CodDelegacion'] : null),
                    table.numero_acta.value(utils.checkString(legajo['NroActa'])),
                    table.operador_carga.value(utils.checkString(legajo['OperadorCarge'])),
                    table.operador_aprobacion.value(legajo['OperadorAprobacion'])
                )
                .returning(table.id)
                .toQuery();

                return connector.execQuery(query);
            })
            .then(r => {
                legajo.id = r.rows[0].id;
                return addComitente(legajo);
            })
        }
        else Promise.resolve();
      })
}



module.exports.migrar = function () {
    console.log('Migrando legajos...');
    let q_objetos = `select L.*, E.CUIT AS CUIT_EMPRESA, E.NOMBRE AS NOMBRE_EMPRESA,
    codTarea=T.codigo
    from LEGTECNICOS L LEFT JOIN Tareas_N2 T ON (L.CODTAREAN2= T.CODIGO)
    LEFT JOIN EMPRESAS E ON (E.ID=L.IDEMPRESA)
    WHERE ID_Solicitud BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(ID_Solicitud) as min, MAX(ID_Solicitud) as max from LEGTECNICOS`;

    return utils.migrar(q_objetos, q_limites, 100, addLegajo);
}

const categorias = require('./categorias');
module.exports.categorias = categorias;

const subcategorias = require('./subcategorias');
module.exports.subcategorias = subcategorias;

const items = require('./items');
module.exports.items = items;

const itemsPredeterminados = require('./itemsPredeterminados');
module.exports.itemsPredeterminados = itemsPredeterminados;

const itemsValoresPred = require('./itemsValoresPred');
module.exports.itemsValoresPred = itemsValoresPred;

const legajo = require('./legajo');
module.exports.legajo = legajo;

const legajoItem = require('./legajoItem');
module.exports.legajoItem = legajoItem;

module.exports.migrar = function() {
  return categorias.migrar()
  .then(r => subcategorias.migrar())
  .then(r => items.migrar())
  .then(r => itemsPredeterminados.migrar())
  .then(r => itemsValoresPred.migrar())
  .then(r => legajo.migrar())
  .then(r => legajoItem.migrar())
}

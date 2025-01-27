import React, { useState, useEffect } from 'react';
import './AdminPanel.css'; // Archivo CSS externo

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/products', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error('Error al cargar productos:', err));
  }, []);

  //Crear Productos
  const handleCreateProduct = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((product) => {
        setProducts((prev) => [...prev, product]);
        setNewProduct({ name: '', price: '', stock: '', category: '' });
        alert('Producto creado exitosamente');
      })
      .catch((err) => alert('Error al crear producto: ' + err.message));
  };

  //Actualizar Productos
  const handleUpdateProduct = (productId) => {
    const fieldsToUpdate = {};
    for (const key in updatedProduct) {
      if (updatedProduct[key] !== editingProduct[key]) {
        fieldsToUpdate[key] = updatedProduct[key];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldsToUpdate),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then(() => {
        alert('Producto actualizado correctamente');
        setEditingProduct(null);
        setUpdatedProduct({});
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId ? { ...product, ...fieldsToUpdate } : product
          )
        );
      })
      .catch((err) => alert('Error al actualizar producto: ' + err.message));
  };


  //Borrar Productos
  const handleDeleteProduct = (productId) => {
    fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then(() => {
        alert('Producto eliminado correctamente');
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
      })
      .catch((err) => alert('Error al eliminar producto: ' + err.message));
  };

  return (
    <div className="admin-panel">
      <h1 className="title" style={{ marginBottom: '30px' }}>Panel de Administración</h1>

      <form className="create-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }} onSubmit={handleCreateProduct}>
        <input
          type="text"
          placeholder="Nombre"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Precio"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          required
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          required
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" className="create-button" style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Crear Producto
        </button>
      </form>

      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {editingProduct === product.id ? (
                  <input
                    type="text"
                    defaultValue={product.name}
                    onChange={(e) =>
                      setUpdatedProduct((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  product.name
                )}
              </td>
              <td>
  {editingProduct === product.id ? (
    <input
      type="number"
      defaultValue={product.price}
      onChange={(e) =>
        setUpdatedProduct((prev) => ({
          ...prev,
          price: parseFloat(e.target.value),
        }))
      }
    />
  ) : (
    `$${isNaN(product.price) ? '0.00' : parseFloat(product.price).toFixed(2)}`
  )}
</td>

              <td>
                {editingProduct === product.id ? (
                  <input
                    type="number"
                    defaultValue={product.stock}
                    onChange={(e) =>
                      setUpdatedProduct((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value, 10),
                      }))
                    }
                  />
                ) : (
                  product.stock
                )}
              </td>
              <td>
                {editingProduct === product.id ? (
                  <input
                    type="text"
                    defaultValue={product.category}
                    onChange={(e) =>
                      setUpdatedProduct((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />
                ) : (
                  product.category
                )}
              </td>
              <td>
                {editingProduct === product.id ? (
                  <>
                    <button className="save-button" onClick={() => handleUpdateProduct(product.id)}>
                      Guardar
                    </button>
                    <button className="cancel-button" onClick={() => setEditingProduct(null)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-button"
                      onClick={() => setEditingProduct(product.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default AdminPanel;

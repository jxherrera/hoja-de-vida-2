import { useState, useEffect } from 'react';
import { Link } from "react-router-dom"; // Asegúrate que sea react-router-dom

function ListaPosts() {
  const [pagina, setPagina] = useState(1);
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // NUEVO: Estados para el filtro
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState(''); // Guarda el ID del usuario seleccionado

  const limite = 4;

  // 1. Efecto para cargar la lista de usuarios (para el filtro)
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios para filtro", error);
      }
    };
    cargarUsuarios();
  }, []);

  // 2. Efecto principal para cargar posts (modificado con el filtro)
  useEffect(() => {
    const cargarPosts = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Construimos la URL base
        let url = `/api/posts?_page=${pagina}&_per_page=${limite}`;
        
        // Si hay un usuario seleccionado, lo agregamos a la URL
        if (filtroUsuario) {
          url += `&userId=${filtroUsuario}`;
        }

        console.log('Fetching:', url);
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);
        
        const datos = await respuesta.json();
        // Soporte para json-server paginado o directo
        const listaPosts = Array.isArray(datos) ? datos : (datos.data || []);
        
        setPosts(listaPosts);
      } catch (err) {
        setError(err.message);
        setPosts([]);
      } finally {
        setCargando(false);
      }
    };

    cargarPosts();
  }, [pagina, limite, filtroUsuario]); // Se ejecuta si cambia la página o el filtro

  // Función para manejar el cambio de filtro
  const handleFiltroChange = (e) => {
    setFiltroUsuario(e.target.value);
    setPagina(1); // Importante: Reiniciar a página 1 al filtrar
  };

  if (error) return <div className="error"><h2>❌ Error</h2><p>{error}</p></div>;

  return (
    <div className="lista-posts-container">
      <div className="header-lista">
        <h2>📝 Lista de Posts</h2>
        
        {/* NUEVO: Select para filtrar */}
        <div className="filtro-container">
          <label>Filtrar por autor: </label>
          <select value={filtroUsuario} onChange={handleFiltroChange} className="input-filtro">
            <option value="">Todos los usuarios</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="cargando"><div className="spinner"></div><p>Cargando...</p></div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.body.substring(0, 100)}...</p>
                <Link to={`/posts/${post.id}`} className="btn-ver">Leer más →</Link>
              </div>
            ))}
          </div>
          
          {posts.length === 0 && <p className="no-results">No hay posts para este usuario.</p>}

          <div className="paginacion">
            <button 
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="btn-paginacion"
            >
              ← Anterior
            </button>
            <span className="pagina-actual">Página {pagina}</span>
            <button 
              onClick={() => setPagina(p => p + 1)}
              disabled={posts.length < limite} // Deshabilitar si hay menos items del limite
              className="btn-paginacion"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ListaPosts;
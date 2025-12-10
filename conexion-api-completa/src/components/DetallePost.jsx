import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Asegúrate de usar react-router-dom
import { useFetch } from '../hooks/useFetch';

function DetallePost() {
  const { id: postId } = useParams();
  const navigate = useNavigate();

  // 1. Usamos tu hook para traer el Post
  const { data: post, loading: cargando, error } = useFetch(`/api/posts/${postId}`);

  // 2. Estado para el usuario (se llenará cuando cargue el post)
  const [usuario, setUsuario] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // 3. Efecto: Cuando 'post' cambia (ya se cargó), buscamos a su autor
  useEffect(() => {
    if (post && post.userId) {
      const cargarAutor = async () => {
        try {
          const respuesta = await fetch(`/api/users/${post.userId}`);
          if (respuesta.ok) {
            const dataUser = await respuesta.json();
            setUsuario(dataUser);
          }
        } catch (error) {
          console.error("No se pudo cargar el autor", error);
        }
      };
      cargarAutor();
    }
  }, [post]); // Se ejecuta cada vez que 'post' tiene datos nuevos

  // Lógica de eliminación que ya tenías
  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este post?')) return;

    try {
      setEliminando(true);
      const respuesta = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });

      if (!respuesta.ok) throw new Error('No se pudo eliminar el post');

      console.log('Post eliminado:', postId);
      navigate('/'); // Volver al inicio
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) return <div className="cargando"><div className="spinner"></div><p>Cargando post...</p></div>;
  if (error) return <div className="error"><h2>❌ Error</h2><p>{error}</p></div>;
  if (!post) return <div className="error">Post no encontrado</div>;

  return (
    <div className="detalle-container">
      <Link to="/" className="btn-volver">← Volver a la lista</Link>

      <div className="post-completo">
        <h1 className="post-titulo">{post.title}</h1>
        
        {/* TARJETA DEL USUARIO (Estilo nuevo) */}
        {usuario && (
            <div className="autor-card">
                <h3>Escrito por:</h3>
                <div className="autor-info">
                    {/* Placeholder para avatar usando la inicial */}
                    <div className="avatar-placeholder">{usuario.name.charAt(0)}</div>
                    <div>
                        <p className="autor-nombre">{usuario.name}</p>
                        <p className="autor-email">{usuario.email}</p>
                        {/* Si tuvieras ruta de perfil de usuario, iría aquí */}
                        {/* <Link to={`/usuarios/${usuario.id}`} className="ver-perfil-btn">Ver perfil</Link> */}
                    </div>
                </div>
            </div>
        )}

        <div className="post-cuerpo">
          <p>{post.body}</p>
        </div>

        <div className="acciones" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <Link to={`/posts/${postId}/edit`} className="btn-paginacion" style={{ marginRight: '10px', textDecoration: 'none' }}>
            ✏️ Editar
          </Link>
          <button 
            onClick={handleEliminar} 
            className="btn-paginacion"
            style={{ backgroundColor: '#e74c3c' }} // Rojo para eliminar
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetallePost;
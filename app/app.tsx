import { useGetPostsQuery } from "@/services/api";
import "./App.css";

function App() {
  const {
    data: posts,
    error,
    isLoading,
    isFetching,
  } = useGetPostsQuery();

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>Something went wrong!</h2>;
  }

  return (
    <div className="container">
      <h1>Posts</h1>

      {isFetching && <p>Updating...</p>}

      <div className="card-grid">
        {posts?.map((post) => (
          <div className="card" key={post.id}>
            <span className="card-id">#{post.id}</span>

            <h2>{post.title}</h2>

            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

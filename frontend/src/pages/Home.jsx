import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Bienvenue sur PotCommun</h1>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/register"><button>Register</button></Link>
        </div>
    );
}

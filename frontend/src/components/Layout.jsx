import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
    return (
        <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", color: "#1a1a2e", margin: 0, padding: 0 }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
      `}</style>
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
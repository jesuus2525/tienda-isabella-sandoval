import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../layout/RootLayout";
import { HomePage, AboutPage, AdminPage, LoginPage } from "../pages";
import { AuthGuard } from "../components/shared/AuthGuard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "sobre-nosotros",
                element: <AboutPage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            // Envolvemos la ruta del Admin con el Guardián de Seguridad
            {
                element: <AuthGuard />,
                children: [
                    {
                        path: "admin",
                        element: <AdminPage />,
                    }
                ]
            }
        ]
    }
]);
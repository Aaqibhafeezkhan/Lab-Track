
/*
  Routing (from the preact-iso package)
  LocationProvider: lets any component ask "what's the current URL?"
  Router:           looks at the URL and shows the matching route
  Route:            one line of the route table, "this path shows this component"
*/
import { LocationProvider, Router, Route } from "preact-iso";

// Styles
import "./styles/global.css";

// Components
import { CurrentUserProvider } from "./lib/currentUser"; // Who's logged in? (and their role)
import { Layout } from "./components/Layout";            // The page layout (header, nav, main content)
import { RequireRole } from "./components/RequireRole";  // Only show this page if the user has the right role

// Pages
import { Home } from "./pages/Home";                      // The home page (anyone can see this)
import Login from "./pages/Login";                        // The login page (anyone can see this)
import { Borrow } from "./pages/Borrow";                  // The borrow page (any signed-in user)
import { MySlips } from "./pages/MySlips";                // The "my slips" page (any signed-in user)
import { SlipDetail } from "./pages/SlipDetail";
import { Survey } from "./pages/Survey";
import { AdminSlips } from "./pages/AdminSlips";
import { AdminSlipDetail } from "./pages/AdminSlipDetail";
import { AdminOut } from "./pages/AdminOut";
import { AdminCatalog } from "./pages/AdminCatalog";
import { NotFound } from "./pages/NotFound";

const signedIn = (Page) => (props) => (
  <RequireRole>
    <Page {...props} />
  </RequireRole>
);
const adminOnly = (Page) => (props) => (
  <RequireRole role="admin">
    <Page {...props} />
  </RequireRole>
);

const BorrowPage = signedIn(Borrow);
const MySlipsPage = signedIn(MySlips);
const SlipDetailPage = signedIn(SlipDetail);
const SurveyPage = signedIn(Survey);
const AdminSlipsPage = adminOnly(AdminSlips);
const AdminSlipDetailPage = adminOnly(AdminSlipDetail);
const AdminOutPage = adminOnly(AdminOut);
const AdminCatalogPage = adminOnly(AdminCatalog);

export function App() {
  return (
    <CurrentUserProvider>
      <LocationProvider>
        <Layout>
          <Router>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />

            <Route path="/borrow" component={BorrowPage} />
            <Route path="/slips" component={MySlipsPage} />
            <Route path="/slips/:id" component={SlipDetailPage} />
            <Route path="/survey/:id" component={SurveyPage} />

            <Route path="/admin" component={AdminSlipsPage} />
            <Route path="/admin/slips/:id" component={AdminSlipDetailPage} />
            <Route path="/admin/out" component={AdminOutPage} />
            <Route path="/admin/catalog" component={AdminCatalogPage} />

            <Route default component={NotFound} />
          </Router>
        </Layout>
      </LocationProvider>
    </CurrentUserProvider>
  );
}
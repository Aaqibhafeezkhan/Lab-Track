import { LocationProvider, Router, Route } from "preact-iso";
import "./styles/global.css";

import { CurrentUserProvider } from "./lib/currentUser";
import { Layout } from "./components/Layout";
import { RequireRole } from "./components/RequireRole";

import { Home } from "./pages/Home";
import Login from "./pages/Login"; // <- change to match CJ's file/export name
import { Borrow } from "./pages/Borrow";
import { MySlips } from "./pages/MySlips";
import { SlipDetail } from "./pages/SlipDetail";
import { Survey } from "./pages/Survey";
import { AdminSlips } from "./pages/AdminSlips";
import { AdminSlipDetail } from "./pages/AdminSlipDetail";
import { AdminOut } from "./pages/AdminOut";
import { AdminCatalog } from "./pages/AdminCatalog";
import { NotFound } from "./pages/NotFound";

// Wrap a page so it needs login (or admin). Defined once, outside the component.
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
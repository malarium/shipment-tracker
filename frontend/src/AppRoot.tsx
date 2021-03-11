import { useAuth0 } from '@auth0/auth0-react'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import ApolloAuthProvider from './components/ApolloAuthProvider'
import PrivateRoute from './components/PrivateRoute'
import AdminPage from './pages/AdminPage'
import ApolloDemoPage from './pages/ApolloDemo'
import GroupCreatePage from './pages/groups/GroupCreatePage'
import GroupEditPage from './pages/groups/GroupEditPage'
import GroupList from './pages/groups/GroupList'
import HomePage from './pages/Home'
import LoadingPage from './pages/LoadingPage'
import NotFoundPage from './pages/NotFoundPage'
import PublicHomePage from './pages/PublicHome'
import ROUTES from './utils/routes'

const fetchProfile = (token: string) => {
  return fetch('/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

const AppRoot = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [profileIsLoaded, setProfileIsLoaded] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !profileIsLoaded) {
      getAccessTokenSilently()
        .then(fetchProfile)
        .then((response) => {
          if (response.ok) {
            setProfileIsLoaded(true)
          } else {
            console.error('Non-OK server response retrieving profile')
          }
        })
    }
  }, [isAuthenticated, getAccessTokenSilently, profileIsLoaded])

  return (
    <ApolloAuthProvider>
      <Router>
        <Switch>
          {isLoading && (
            <Route>
              <LoadingPage />
            </Route>
          )}
          <Route path={ROUTES.HOME} exact>
            {isAuthenticated ? <HomePage /> : <PublicHomePage />}
          </Route>
          <PrivateRoute
            path={ROUTES.ADMIN_ROOT}
            isAuthenticated={isAuthenticated}
            exact
          >
            <AdminPage />
          </PrivateRoute>
          <Route path={ROUTES.APOLLO_DEMO}>
            <ApolloDemoPage />
          </Route>
          <PrivateRoute
            path={ROUTES.GROUP_LIST}
            exact
            isAuthenticated={isAuthenticated}
          >
            <GroupList />
          </PrivateRoute>
          <PrivateRoute
            path={ROUTES.GROUP_CREATE}
            exact
            isAuthenticated={isAuthenticated}
          >
            <GroupCreatePage />
          </PrivateRoute>
          <PrivateRoute
            path={ROUTES.GROUP_EDIT}
            exact
            isAuthenticated={isAuthenticated}
          >
            <GroupEditPage />
          </PrivateRoute>
          <PrivateRoute isAuthenticated={isAuthenticated} path="*">
            <NotFoundPage />
          </PrivateRoute>
        </Switch>
      </Router>
    </ApolloAuthProvider>
  )
}

export default AppRoot

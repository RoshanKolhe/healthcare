'use client';

import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { PERMISSION_KEY } from 'src/utils/constants';
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      const permission = sessionStorage.getItem(PERMISSION_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        let response;

        if (permission === 'clinic') {
          response = await axios.get(endpoints.auth.clinic.me);
        } else if (permission === 'doctor') {
          response = await axios.get(endpoints.auth.doctor.me);
        } else {
          // super_admin
          response = await axios.get(endpoints.auth.me);
        }

        const user = response.data;

        dispatch({
          type: 'INITIAL',
          payload: { user },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: { user: null },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: { user: null },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ---------------- Super Admin LOGIN (unchanged) ----------------
  const login = useCallback(async (email, password) => {
    const data = { email, password };

    const response = await axios.post(endpoints.auth.login, data);

    const { accessToken, user } = response.data;

    if (user && user.permissions.includes('super_admin')) {
      setSession(accessToken);
      sessionStorage.setItem(PERMISSION_KEY, user.permissions[0]);
    } else throw new Error("User doesn't have permission");

    dispatch({
      type: 'LOGIN',
      payload: { user },
    });
  }, []);

  // ---------------- Clinic LOGIN ----------------
  const clinicLogin = useCallback(async (email, password) => {
    const data = { email, password };

    const response = await axios.post(endpoints.auth.clinic.login, data);

    const { accessToken, user } = response.data;

    if (user && user.permissions.includes('clinic')) {
      setSession(accessToken);
      sessionStorage.setItem(PERMISSION_KEY, user.permissions[0]);
    } else throw new Error("User doesn't have permission");

    dispatch({
      type: 'LOGIN',
      payload: { user },
    });
  }, []);

  // ---------------- Clinic LOGIN ----------------
  const branchLogin = useCallback(async (email, password) => {
    const data = { email, password };

    const response = await axios.post(endpoints.auth.branch.login, data);

    const { accessToken, user } = response.data;

    if (user && user.permissions.includes('branch')) {
      setSession(accessToken);
      sessionStorage.setItem(PERMISSION_KEY, user.permissions[0]);
    } else throw new Error("User doesn't have permission");

    dispatch({
      type: 'LOGIN',
      payload: { user },
    });
  }, []);

  // ---------------- Doctor LOGIN ----------------
  const doctorLogin = useCallback(async (email, password) => {
    const data = { email, password };

    const response = await axios.post(endpoints.auth.doctor.login, data);

    const { accessToken, doctor } = response.data;
    console.log(doctor);

    if (doctor && doctor.permissions.includes('doctor')) {
      setSession(accessToken);
      sessionStorage.setItem(PERMISSION_KEY, doctor.permissions[0]);
    } else throw new Error("Doctor doesn't have permission");

    dispatch({
      type: 'LOGIN',
      payload: { user: doctor },
    });
  }, []);

  // REGISTER (common, but probably only for super_admin in your case)
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = { email, password, firstName, lastName };

    const response = await axios.post(endpoints.auth.doctor.register, data);

    const { accessToken, doctor } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: { user: doctor },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login, // super_admin login
      clinicLogin, // clinic login
      doctorLogin, // doctor login
      branchLogin, // branch login
      register,
      logout,
    }),
    [login, clinicLogin, branchLogin, doctorLogin, register, logout, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

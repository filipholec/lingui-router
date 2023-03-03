import {
  Route as RRRoute,
  RouteProps as RRRouteProps,
} from "react-router";
import * as React from "react";
import {WithLinguiRouter} from "./LinguiRouter";
import {isTranslatedMatch, RouterI18n, TranslatedLocation, TranslatedMatch} from "./RouterI18n";

import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import * as H from "history";

interface SwitchProps {
  children?: React.ReactNode | undefined;
  location?: H.Location | undefined;
}

class RRSwitch extends React.Component<SwitchProps, any> {}

function withRouter(Component: any) {
  function ComponentWithRouterProp(props: any) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}


export interface RouteChildrenProps<T = {}> {
  location: TranslatedLocation
  match: TranslatedMatch<T>
}

export interface RouteComponentProps<T = {}> {
  location: TranslatedLocation
  match: TranslatedMatch<T>
}

export interface RouteProps<T = any> extends Omit<RRRouteProps, 'component' | 'render' | 'children'> {
  component?: React.ComponentType<RouteComponentProps<T>> | React.ComponentType<any>;
  render?: ((props: RouteComponentProps<T>) => React.ReactNode);
  children?: any;

  location?: TranslatedLocation
  computedMatch?: TranslatedMatch<T> // Match computed by a switch component Switch above
}

function renderRoutePair(routerI18n: RouterI18n, routeContext: RouteChildrenProps, props: RouteProps) {
  const {path, component, render, children, ...otherProps} = props;
  const location = otherProps.location || routerI18n.normalizeLocation(routeContext.location);

  let match: TranslatedMatch<any> | null;
  if (otherProps.computedMatch) {
    match = otherProps.computedMatch;
  } else if (!path && isTranslatedMatch(routeContext.match)) {
    match = routeContext.match;
  } else {
    match = routerI18n.findTranslatedMatch(location.pathname);
  }

  const routeProps: RouteProps = {...props, location, computedMatch: match || undefined};

  const key = Array.isArray(path) ? path.join(';') : path;

  return [
    <RRRoute {...routeProps} path={routerI18n.route(path)} key={`${key || 'route'}-i18n`}/>,
    <RRRoute {...routeProps} path={path} key={key || 'route'}/>,
  ]
}

export const Route = (props: RouteProps) => (
  <WithLinguiRouter>{(routerI18n) => (
    <RRRoute>{(routeComponentProps: any) => renderRoutePair(routerI18n, routeComponentProps, props)}</RRRoute>
  )}</WithLinguiRouter>
);

function flat<T>(acc: T[], value: T | T[]) {
  if (Array.isArray(value)) {
    return [...acc, ...value];
  } else {
    return [...acc, value];
  }
}

const SwitchComponent = ({children, ...routeComponentProps}: RouteChildrenProps & SwitchProps) => (
  <WithLinguiRouter>{(routerI18n) => {
    const routes = React.Children
      .toArray(children)
      .map(el =>
        React.isValidElement(el)
          ? renderRoutePair(routerI18n, routeComponentProps, el.props)
          : el || null
      )
      .reduce(flat, []);

    return <RRSwitch>{routes}</RRSwitch>;
  }}</WithLinguiRouter>
);

export const Switch: React.ComponentType<{children: React.ReactNode}> = withRouter(SwitchComponent) as any;
Switch.displayName = "Switch";

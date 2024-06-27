import { Link } from 'react-router-dom';
import { getLoggedInUser } from '../utils/auth';
import { getUserBaseModulePath } from '../utils/helpers';

const NotFound = () => {
  let user
    const loggedUser = getLoggedInUser()
    if (loggedUser) {
        user = loggedUser
    }
 return (<div className="h-screen justify-center text-center">
    <div className="mt-24 m-auto">
      <div className=" tracking-widest mt-4">
        <span className="text-gray-500 text-6xl block">
          <span>4 0 4</span>
        </span>
        <span className="text-gray-500 text-xl">
          Sorry, We couldn't find what you are looking for!
        </span>
      </div>
    </div>
    <div className="mt-6">
      
      <Link to={getUserBaseModulePath(user)}>
        <a className="text-gray-500 font-mono text-xl bg-gray-200 p-3 rounded-md hover:shadow-md">
          Go back
          {' '}
        </a>
      </Link>
    </div>
  </div>)
};
export default NotFound;

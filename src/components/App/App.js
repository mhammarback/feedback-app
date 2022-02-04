import * as React from 'react';
import PropTypes from 'prop-types';
import styles from './App.scss';
import Input from './Input/Input';



const App = ({ name , pageName, prevFeedback, name2, version  }) => {
  const [feedback, setFeedback] = React.useState([]);

  React.useEffect(() => {
    setFeedback(prevFeedback);
  }, []);

    return (
      <div className={styles.container}>
        <p className={styles.text}>{name}</p>
        <Input setFeedback={(newFeedback) => setFeedback(newFeedback)} />

        <p className={styles.text}>
          This is the previous feedback for {`page: ${pageName}`} :
        </p>
        <ol className="env-list env-list-dividers--top">
          {feedback.length > 0 &&
          feedback.map((item) => {
            if(item.pageName === pageName) {
             return (
              <li key={item.dsid} className="env-p-around--small">
               {`feedback: ${item.input}, page: ${item.pageName}`}
             </li>
            );
            }
          })}
        </ol>
      </div>
    );
};

App.propTypes = {
  name: PropTypes.string,
  pageName: PropTypes.string,
  prevFeedback: PropTypes.array
};

export default App;


/*

   <ol className="env-list env-list-dividers--top">
          {feedback.length > 0 &&
            feedback.map((item) => {
              return (
                <li key={item.dsid} className="env-p-around--small">
                  {`feedback: ${item.input}, page: ${item.pageName}`}
                </li>
              );
            })}
        </ol>

*/
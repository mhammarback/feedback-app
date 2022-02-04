import * as React from 'react';
import requester from '@sitevision/api/client/requester';
import router from '@sitevision/api/common/router';
import toasts from '@sitevision/api/client/toasts';
import i18n from "@sitevision/api/common/i18n";

const Input = ({ setFeedback }) => {
  const [inputValue, setInputValue] = React.useState("");

  const updateValue = (e) => {
    setInputValue(e.currentTarget.value);
  };


//requester, vi vill hämta data från routern i index.js och skicka med InputValue som parameter värdet

//funktion för att spara värdet i datakälla
  const sendFeedback = () => {
    requester.doPost({
      url: router.getStandaloneUrl('/postFeedback'),
      data: {
        property: inputValue,
      },
    }).then((response) => {
      setInputValue("");
      setFeedback(response.prevFeedback)
      toasts.publish({
        message: i18n.get('toast-success'),
        type: 'success',
        callback: () => {
          console.log('successfully posted');
        },
      });
    })
    .catch((response) => {
      alert('error in send feedback');
    });
  };

  //funktion för att skicka mail till ansvarig person
  const vote = (value) => {
    requester
    .doPost({
      url: router.getStandaloneUrl("/vote"),
      data: {
        /* global navigator */
        useragent: navigator.userAgent,
        /* global window */
        clienthref: window.location.href,
        vote: value,
      },
    })
    .done(() => {
      setFeedback(true);
      setInputValue("");
      sendFeedback();
      console.log('done');
    })
    .fail(() => {
      setFeedback(false);
      setInputValue("");
      console.log('fail')
    });
  };



  return (
    <>
    <div class="env-form">
      <div class="env-form-element">
        <label for="text-2" class="env-form-element__label">Feedback:</label>
        <div class="env-form-element__control">
         <input
            type="text"
            class="env-form-input"
            placeholder={i18n.get("inputPlaceholder")}
            id="text-2"
            value={inputValue}
            onChange={updateValue}
          />
        </div>
     </div>
    <button
      type="submit"
      className="env-button env-button--primary env-button--ghost"
     // onClick={sendFeedback}
      onClick={() => {
        vote(true)
    }}
    > {i18n.get("submit")}
    </button>
    </div>
    </>
  );
};


export default Input;
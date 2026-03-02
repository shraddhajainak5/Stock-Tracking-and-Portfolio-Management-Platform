// import React, { useState } from 'react';
// import axios from 'axios';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const WalletComponent = ({ userId, onClose }) => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const [amount, setAmount] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);

//   const quickAmounts = [10, 25, 50, 100];

//   const modalStyles = {
//     overlay: {
//       position: 'fixed',
//       inset: '0px',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       zIndex: 1050,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     modal: {
//       backgroundColor: 'white',
//       borderRadius: '12px',
//       width: '100%',
//       maxWidth: '500px',
//       padding: '0',
//       position: 'relative',
//     },
//     header: {
//       background: 'linear-gradient(120deg, #1E88E5, #00ACC1)',
//       color: 'white',
//       padding: '1.5rem',
//       position: 'relative',
//     },
//     headerTitle: {
//       margin: 0,
//       fontWeight: 600,
//       fontSize: '1.5rem',
//     },
//     closeButton: {
//       position: 'absolute',
//       right: '1.5rem',
//       top: '1.5rem',
//       backgroundColor: 'transparent',
//       border: 'none',
//       color: 'white',
//       fontSize: '1.5rem',
//       cursor: 'pointer',
//     },
//     body: { padding: '1.5rem' },
//     input: {
//       width: '100%',
//       padding: '0.8rem 1rem',
//       borderRadius: '8px',
//       border: '1px solid #E0E0E0',
//       fontSize: '1rem',
//       marginBottom: '1.5rem',
//     },
//     footer: {
//       padding: '1.5rem',
//       borderTop: '1px solid #E0E0E0',
//       display: 'flex',
//       justifyContent: 'flex-end',
//       gap: '0.75rem',
//     },
//     button: {
//       padding: '0.75rem 1.5rem',
//       borderRadius: '8px',
//       fontWeight: '500',
//       cursor: 'pointer',
//     },
//     cancelButton: {
//       backgroundColor: '#F9FAFB',
//       border: '1px solid #E0E0E0',
//       color: '#757575',
//     },
//     submitButton: {
//       backgroundColor: '#1E88E5',
//       color: 'white',
//       border: 'none',
//     },
//     errorMessage: {
//       backgroundColor: '#ffe6e6',
//       color: '#E53935',
//       padding: '0.75rem',
//       borderRadius: '8px',
//       marginTop: '1rem',
//     },
//   };

//   const handleAmountSelect = (value) => {
//     setAmount(value.toString());
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setErrorMessage('');
//     setIsProcessing(true);

//     try {
//       const res = await axios.post(
//         'http://localhost:3000/api/payments/create-payment-intent',
//         {
//           userId,
//           amount: parseFloat(amount) * 100, // cents
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         }
//       );

//       const { clientSecret } = res.data;

//       const result = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement),
//         },
//       });

//       if (result.paymentIntent?.status === 'succeeded') {
//         // Update wallet
//         await axios.post(
//           'http://localhost:3000/api/payments/payment-success',
//           {
//             userId,
//             amount: parseFloat(amount) * 100,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//             },
//           }
//         );

//         setIsSuccess(true);
//         setTimeout(() => onClose(true), 2000);
//       } else {
//         setErrorMessage(result.error?.message || 'Payment failed');
//       }
//     } catch (err) {
//       setErrorMessage(err.response?.data?.error || 'Something went wrong');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div style={modalStyles.overlay}>
//       <div style={modalStyles.modal}>
//         <div style={modalStyles.header}>
//           <h3 style={modalStyles.headerTitle}>Add Funds to Wallet</h3>
//           <button style={modalStyles.closeButton} onClick={() => onClose(false)}>×</button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div style={modalStyles.body}>
//             <div style={{ marginBottom: '1rem' }}>
//               <strong>Quick Amounts:</strong>
//               <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
//                 {quickAmounts.map((amt) => (
//                   <button
//                     key={amt}
//                     type="button"
//                     onClick={() => handleAmountSelect(amt)}
//                     style={{
//                       ...modalStyles.button,
//                       backgroundColor: amount === amt.toString() ? '#1E88E5' : '#E3F2FD',
//                       color: amount === amt.toString() ? '#fff' : '#1E88E5',
//                     }}
//                   >
//                     ${amt}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <label>Custom Amount</label>
//             <input
//               type="number"
//               value={amount}
//               min="1"
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="Enter custom amount"
//               style={modalStyles.input}
//               required
//             />

//             <label>Card Details</label>
//             <div style={{ border: '1px solid #E0E0E0', padding: '1rem', borderRadius: '8px' }}>
//               <CardElement
//                 options={{
//                   style: {
//                     base: {
//                       fontSize: '16px',
//                       color: '#212121',
//                       '::placeholder': {
//                         color: '#757575',
//                       },
//                     },
//                     invalid: {
//                       color: '#E53935',
//                     },
//                   },
//                 }}
//               />
//             </div>

//             {errorMessage && <div style={modalStyles.errorMessage}>{errorMessage}</div>}
//           </div>

//           <div style={modalStyles.footer}>
//             <button type="button" style={{ ...modalStyles.button, ...modalStyles.cancelButton }} onClick={() => onClose(false)}>
//               Cancel
//             </button>
//             <button
//               type="submit"
//               style={{
//                 ...modalStyles.button,
//                 ...modalStyles.submitButton,
//                 opacity: isProcessing || !amount ? 0.7 : 1,
//                 cursor: isProcessing || !amount ? 'not-allowed' : 'pointer',
//               }}
//               disabled={isProcessing || !amount}
//             >
//               {isProcessing ? 'Processing...' : `Pay $${parseFloat(amount || 0).toFixed(2)}`}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default WalletComponent;
import React, { useState } from 'react';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const WalletComponent = ({ userId, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const quickAmounts = [10, 25, 50, 100];

  const modalStyles = {
    overlay: {
      position: 'fixed',
      inset: '0px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '500px',
      padding: '0',
      position: 'relative',
    },
    header: {
      background: 'linear-gradient(120deg, #1E88E5, #00ACC1)',
      color: 'white',
      padding: '1.5rem',
      position: 'relative',
    },
    headerTitle: {
      margin: 0,
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    closeButton: {
      position: 'absolute',
      right: '1.5rem',
      top: '1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
    body: { padding: '1.5rem' },
    input: {
      width: '100%',
      padding: '0.8rem 1rem',
      borderRadius: '8px',
      border: '1px solid #E0E0E0',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
    footer: {
      padding: '1.5rem',
      borderTop: '1px solid #E0E0E0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    cancelButton: {
      backgroundColor: '#F9FAFB',
      border: '1px solid #E0E0E0',
      color: '#757575',
    },
    submitButton: {
      backgroundColor: '#1E88E5',
      color: 'white',
      border: 'none',
    },
    errorMessage: {
      backgroundColor: '#ffe6e6',
      color: '#E53935',
      padding: '0.75rem',
      borderRadius: '8px',
      marginTop: '1rem',
    },
  };

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e) => {
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser.id;
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: Create payment intent from your backend
      const res = await axios.post(
        'http://localhost:3000/api/payments/create-payment-intent',
        {
          userId,
          amount: parseFloat(amount) * 100, // convert to cents
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { clientSecret } = res.data;

      // Step 2: Confirm payment on frontend
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Step 3: Notify backend to update wallet
        await axios.post(
          'http://localhost:3000/api/payments/payment-success',
          {
            userId,
            amount: parseFloat(amount) * 100,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setIsSuccess(true);
        setTimeout(() => onClose(true), 2000);
      } else {
        setErrorMessage('Payment failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || 'Payment error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
   
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              <div style={modalStyles.header}>
                <h3 style={modalStyles.headerTitle}>Add Funds to Wallet</h3>
                <button style={modalStyles.closeButton} onClick={() => onClose(false)}>×</button>
              </div>
      
              <form onSubmit={handleSubmit}>
                <div style={modalStyles.body}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Quick Amounts:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountSelect(amt)}
                          style={{
                            ...modalStyles.button,
                            backgroundColor: amount === amt.toString() ? '#1E88E5' : '#E3F2FD',
                            color: amount === amt.toString() ? '#fff' : '#1E88E5',
                          }}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>
      
                  <label>Custom Amount</label>
                  <input
                    type="number"
                    value={amount}
                    min="1"
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    style={modalStyles.input}
                    required
                  />
      
                  <label>Card Details</label>
                  <div style={{ border: '1px solid #E0E0E0', padding: '1rem', borderRadius: '8px' }}>
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#212121',
                            '::placeholder': {
                              color: '#757575',
                            },
                          },
                          invalid: {
                            color: '#E53935',
                          },
                        },
                      }}
                    />
                  </div>
      
                  {errorMessage && <div style={modalStyles.errorMessage}>{errorMessage}</div>}
                </div>
      
                <div style={modalStyles.footer}>
                  <button type="button" style={{ ...modalStyles.button, ...modalStyles.cancelButton }} onClick={() => onClose(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...modalStyles.button,
                      ...modalStyles.submitButton,
                      opacity: isProcessing || !amount ? 0.7 : 1,
                      cursor: isProcessing || !amount ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isProcessing || !amount}
                  >
                    {isProcessing ? 'Processing...' : `Pay $${parseFloat(amount || 0).toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
    );
};

export default WalletComponent;


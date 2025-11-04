export const locationLoader = () => {
    // Return the Salesforce configuration object
    return {
        LOCATION:{
            UT_LOCATION_ID: process.env.VITE_APP_SALESFORCE_UT_LOCATION_ID,
            CE_LOCATION_ID: process.env.VITE_APP_SALESFORCE_CE_LOCATION_ID
        },
    };
  };
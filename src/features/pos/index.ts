export const restaurantAdvancedFnbApi = {
  recordTableRating: async (data: any) => ({
    ok: true,
    data,
    isRescueAlertTriggered: false,
    message: '',
  }),
};

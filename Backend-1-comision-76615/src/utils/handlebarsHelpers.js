export const registerHelpers = (handlebars) => {
  // Helper para comparar valores
  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });
};


const VueStripeCheckout = {
  install(Vue, key) {
    Vue.component('vue-stripe-checkout', {
      render: h => h('div', { style: { display: 'none' } }),
      props: {
        publishableKey: {
          type: String,
          required: !key,
        },
        image: {
          type: String,
          default: null,
        },
        name: {
          type: String,
          default: null,
        },
        description: {
          type: String,
          default: null,
        },
        amount: {
          type: Number,
          default: 0,
        },
        locale: {
          type: String,
          default: 'en',
        },
        zipCode: {
          type: Boolean,
          default: false,
        },
        billingAddress: {
          type: Boolean,
          default: false,
        },
        currency: {
          type: String,
          default: 'USD',
        },
        panelLabel: {
          type: String,
          default: 'Pay with Card',
        },
        shippingAddress: {
          type: Boolean,
          default: false,
        },
        email: {
          type: String,
          default: null,
        },
        allowRememberMe: {
          type: Boolean,
          default: true,
        },
      },
      mounted() {
        if (document.querySelector('script#_stripe-checkout-script')) {
          return this.setCheckout();
        }
        const script = document.createElement('script');
        script.id = '_stripe-checkout-script';
        script.src = 'https://checkout.stripe.com/checkout.js';
        script.onload = this.setCheckout;
        document.querySelector('head').append(script);
      },
      // NOTE: Should this be enabled for dynamic keys?
      // Cause if it gets updated very quickly, I
      // would imagine bad things would happen
      // updated() {
      //  this.setCheckout();
      // },
      beforeDestroy() {
        const stripeApp = document.querySelector('iframe.stripe_checkout_app');
        if (stripeApp) stripeApp.remove();
      },
      data: () => ({
        checkout: null,
      }),
      computed: {
        key() {
          return this.publishableKey || key;
        },
      },
      methods: {
        setCheckout() {
          const stripeApp = document.querySelector(
            'iframe.stripe_checkout_app'
          );
          if (stripeApp) stripeApp.remove();
          this.checkout = StripeCheckout.configure({ key: this.key });
        },
        open() {
          if (!this.key) {
            return Promise.reject(
              new Error('Public key is required for VueStripeCheckout')
            );
          }
          return new Promise((resolve, _reject) => {
            const options = {
              key: this.key,
              image: this.image,
              name: this.name,
              description: this.description,
              amount: this.amount,
              locale: this.locale,
              zipCode: this.zipCode,
              currency: this.currency,
              panelLabel: this.panelLabel,
              email: this.email,
              billingAddress: this.billingAddress,
              allowRememberMe: this.allowRememberMe,
              token: token => {
                this.$emit('done', token);
                resolve(token);
              },
              opened: () => this.$emit('opened'),
              closed: () => this.$emit('closed'),
            };
            if (this.shippingAddress)
              Object.assign(options, {
                shippingAddress: true,
                billingAddress: true,
              });
            this.checkout.open(options);
          });
        },
      },
    });
  },
};

export default VueStripeCheckout;

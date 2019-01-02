<template>
  <div class="fixed-center">
    <p>
      <img src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="Logo Compani" style="max-width: 250px">
    </p>
    <p>{{ acknowledgement }}</p>
  </div>
</template>

<script>
export default {
  props: {
    signed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    acknowledgement () {
      if (this.signed) return "Merci d'avoir signé ! Vous pouvez à présent fermer la fenêtre.";
      return 'Vous pouvez à présent fermer la fenêtre.';
    }
  }
}
</script>

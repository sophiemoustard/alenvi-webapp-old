import { NotifyNegative, NotifyPositive } from '../components/popup/notify';

export const configMixin = {
  methods: {
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        const node = this.$children[0].$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
        if (node) {
          node[0].$refs[refName].reset();
        }
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
      } else {
        const node = this.$children[0].$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
        if (node) {
          node[0].$refs[refName].upload();
        }
      }
    },
    async deleteDocument (driveId, type, key) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.$gdrive.removeFileById({ id: driveId });
        const payload = {
          _id: this.company._id,
          [key]: {
            templates: {
              [type]: { driveId: null, link: null },
            }
          }
        };
        await this.$companies.updateById(payload);
        this.refreshCompany();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    documentUploaded () {
      NotifyPositive('Document envoyé');
      this.refreshCompany();
    },
  },
};

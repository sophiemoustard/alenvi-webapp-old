import { Alert } from 'quasar'
import 'quasar-extras/animate/bounceInRight.css'
import 'quasar-extras/animate/bounceOutRight.css'

export const alenviAlert = (params) => {
  const myAlert = Alert.create({
    enter: 'bounceInRight',
    leave: 'bounceOutRight',
    color: params.color,
    icon: params.icon,
    html: params.content,
    position: params.position
  });
  setTimeout(() => {
    myAlert.dismiss();
  }, params.duration)
}

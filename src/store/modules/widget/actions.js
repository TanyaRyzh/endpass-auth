import { METHODS, WIDGET_RESIZE_DURATION } from '@/constants';
import bridgeMessenger from '@/class/singleton/bridgeMessenger';
import { logout } from '@/service/identity';

const openWidget = async ({ dispatch }, { widgetNode, root = false }) => {
  await bridgeMessenger.sendAndWaitResponse(METHODS.WIDGET_OPEN, {
    root,
  });
  dispatch('fitWidget', widgetNode);
};

const closeWidget = async ({ dispatch }, widgetNode) => {
  await bridgeMessenger.send(METHODS.WIDGET_CLOSE);
  dispatch('fitWidget', widgetNode);
};

const openAccounts = async ({ dispatch }, widgetNode) => {
  await dispatch('openWidget', {
    widgetNode,
  });
  dispatch('fitWidget', widgetNode);
};

const closeAccounts = async ({ dispatch }, widgetNode) => {
  dispatch('fitWidget', widgetNode);
};

const fitWidget = (ctx, widgetNode) => {
  setTimeout(() => {
    bridgeMessenger.send(METHODS.WIDGET_FIT, {
      height: widgetNode.clientHeight,
    });
  }, WIDGET_RESIZE_DURATION + 100);
};

const getWidgetSettings = async ({ commit }) => {
  const settings = await bridgeMessenger.sendAndWaitResponse(
    METHODS.WIDGET_GET_SETTING,
  );

  commit('setWidgetSettings', settings);
};

const changeWidgetAccount = async (ctx, address) => {
  const newSettings = await bridgeMessenger.sendAndWaitResponse(
    METHODS.WIDGET_CHANGE_ACCOUNT,
    {
      address,
    },
  );

  bridgeMessenger.send(METHODS.BROADCAST, {
    type: 'settings',
    data: newSettings,
  });
};

const widgetLogout = async () => {
  try {
    await logout();
    await bridgeMessenger.sendAndWaitResponse(METHODS.WIDGET_LOGOUT);
    await bridgeMessenger.send(METHODS.BROADCAST, {
      type: 'logout',
    });
  } catch (err) {
    /* eslint-disable-next-line */
    console.log(err);
  }
};

export default {
  openWidget,
  closeWidget,
  openAccounts,
  closeAccounts,
  fitWidget,
  getWidgetSettings,
  changeWidgetAccount,
  widgetLogout,
};

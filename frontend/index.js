//-- Root assets
import "./assets/favicon.ico";
import "./assets/robots.txt";
import "./assets/sitemap.xml";
import "./assets/about.css";
import "./assets/email.css";
import "./assets/logo_email.png";
//-- Dependences
import vue from "vue";
import vueRouter from "vue-router";
import vueNoty from "vuejs-noty";
import vueClipboard from "vue-clipboard2";
import axios from "axios";
import vueAxios from "vue-axios";
import fontawesome from '@fortawesome/fontawesome';
import fontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { 
	faQuestionCircle,
	faTrashAlt,
	faSave,
	faCheck,
	faDownload,
	faCopy,
	faSyncAlt,
   faTrash,
   faEdit,
   faPlus,
   faDatabase,
   faWrench,
	faList,
	faFilter,
   faPrint
} from '@fortawesome/fontawesome-free-solid';
import bootstrapVue from "bootstrap-vue";
import store from "./store";
import root from "./components/root.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "vuejs-noty/dist/vuejs-noty.css";

// Font Awesome 5 configurations
fontawesome.library.add(
	faQuestionCircle,
	faTrashAlt,
	faTrash,
	faSave,
	faCheck,
	faDownload,
	faCopy,
	faSyncAlt,
	faEdit,
	faPlus,
	faDatabase,
	faWrench,
	faList,
	faFilter,
	faPrint
);

const router = new vueRouter({
	routes: [
		{
			path: "/",
			component: () =>
				import(/* webpackChunkName: "landing" */ "./components/landing.vue")
		},
		{
			path: "/start",
			component: () =>
				import(/* webpackChunkName: "start" */ "./components/start.vue")
		},
		{
			path: "/email",
			component: () =>
				import(/* webpackChunkName: "email" */ "./components/email.vue")
		},
		{
			path: "/admin",
			component: () =>
				import(/* webpackChunkName: "admin" */ "./components/admin/index.vue")
		},
		{
			path: "*",
			component: () =>
				import(/* webpackChunkName: "404" */ "./components/404.vue")
		}
	],
	mode: "history"
});
vue.component('font-awesome-icon', fontAwesomeIcon);
vue.use(bootstrapVue);
vue.use(vueRouter);
vue.use(vueClipboard);
vue.use(vueAxios, axios);
vue.use(vueNoty, {
	killer: true,
	theme: "metroui",
	timeout: 4000,
	progressBar: false,
	layout: "topRight"
});

new (vue.extend(root))({ store, router }).$mount("#app");

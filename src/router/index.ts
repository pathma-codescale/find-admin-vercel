import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CreateCandidate from '../views/CreateCandidate.vue'
import CandidatesView from '@/views/CandidatesView.vue'
import CreateEnterprise from '@/views/CreateEnterprise.vue'
import AdminView from '@/views/AdminView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ForgotPasswordResendEmailView from '@/views/ForgotPasswordResendEmailView.vue'
import PasswordRestSuccessView from '@/views/PasswordRestSuccessView.vue'
import SetNewPassword from '@/views/SetNewPassword.vue'
import CreateNewPasswordView from '@/views/CreateNewPasswordView.vue'
import ResetNewPasswordView from '@/views/ResetNewPasswordView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'DashboardView',
      component: DashboardView,
      meta: {
        fullWidth: true,
        breadcrumbs: [{ name: 'dashboard' }],
      },
    },
    // Candidates Routes
    {
      path: '/manage-users/candidates',
      name: 'Candidates',
      component: CandidatesView,
      meta: {
        breadcrumbs: [{ name: 'manageUsers', to: '/manage-users' }, { name: 'candidates' }],
      },
    },
    {
      path: '/manage-users/createCandidate',
      name: 'createCandidate',
      component: CreateCandidate,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'candidates', to: '/manage-users/candidates' },
          { name: 'addNewCandidate' },
        ],
      },
    },
    {
      path: '/manage-users/editCandidate/:id',
      name: 'EditCandidate',
      component: CreateCandidate,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'candidates', to: '/manage-users/candidates' },
          { name: 'editCandidate' },
        ],
      },
    },
    {
      path: '/manage-users/candidates/:id/view',
      name: 'ViewCandidate',
      component: CreateCandidate,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'candidates', to: '/manage-users/candidates' },
          { name: 'viewCandidate' },
        ],
      },
    },

    // Enterprises Routes
    {
      path: '/manage-users/enterprises',
      name: 'enterprises',
      component: () => import('../views/EnterprisesView.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageUsers', to: '/manage-users' }, { name: 'enterprises' }],
      },
    },
    {
      path: '/manage-users/createEnterprise',
      name: 'createEnterprise',
      component: CreateEnterprise,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'enterprises', to: '/manage-users/enterprises' },
          { name: 'addNewEnterprise' },
        ],
      },
    },
    {
      path: '/manage-users/enterprises/:id/edit',
      name: 'editEnterprise',
      component: CreateEnterprise,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'enterprises', to: '/manage-users/enterprises' },
          { name: 'editEnterprise' },
        ],
      },
    },
    {
      path: '/manage-users/enterprises/:id/view',
      name: 'viewEnterprise',
      component: CreateEnterprise,
      meta: {
        breadcrumbs: [
          { name: 'manageUsers', to: '/manage-users' },
          { name: 'enterprises', to: '/manage-users/enterprises' },
          { name: 'viewEnterprise' },
        ],
      },
    },

    // Jobs Routes
    {
      path: '/manage-jobs',
      name: 'manageJobs',
      component: () => import('../views/JobsView.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageJobs' }],
      },
    },
    {
      path: '/manage-jobs/create',
      name: 'createJob',
      component: () => import('../views/CreateJob.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageJobs', to: '/manage-jobs' }, { name: 'addNewJob' }],
      },
    },
    {
      path: '/manage-jobs/edit-job/:id',
      name: 'editJob',
      component: () => import('../views/CreateJob.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageJobs', to: '/manage-jobs' }, { name: 'editJob' }],
      },
    },
    {
      path: '/manage-jobs/view-job/:id',
      name: 'viewJob',
      component: () => import('../views/CreateJob.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageJobs', to: '/manage-jobs' }, { name: 'viewJob' }],
      },
    },

    // Admins Routes
    {
      path: '/manage-admins',
      name: 'manageAdmins',
      component: AdminView,
      meta: {
        breadcrumbs: [{ name: 'manageAdmins' }],
      },
    },
    {
      path: '/manage-admins/create',
      name: 'createAdmin',
      component: () => import('../views/CreateAdmin.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAdmins', to: '/manage-admins' }, { name: 'addNewAdmin' }],
      },
    },
    {
      path: '/manage-admins/editAdmin/:id',
      name: 'editAdmin',
      component: () => import('../views/CreateAdmin.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAdmins', to: '/manage-admins' }, { name: 'editAdmin' }],
      },
    },
    {
      path: '/manage-admins/viewAdmin/:id',
      name: 'viewAdmin',
      component: () => import('../views/CreateAdmin.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAdmins', to: '/manage-admins' }, { name: 'viewAdmin' }],
      },
    },

    // Alerts Routes
    {
      path: '/manage-alerts',
      name: 'manageAlerts',
      component: () => import('../views/AlertsView.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAlerts', to: '/manage-alerts' }],
      },
    },
    {
      path: '/manage-alerts/create',
      name: 'createAlert',
      component: () => import('../views/CreateAlert.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAlerts', to: '/manage-alerts' }, { name: 'createAlert' }],
      },
    },

    {
      path: '/manage-alerts/edit-alert/:id',
      name: 'editAlert',
      component: () => import('../views/CreateAlert.vue'),
      meta: {
        breadcrumbs: [{ name: 'manageAlerts', to: '/manage-alerts' }, { name: 'editAlert' }],
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        breadcrumbs: [{ name: 'settings' }],
      },
    },

    // Password Routes

    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { fullWidth: true },
    },
    {
      path: '/forgot-password-resend-email',
      name: 'forgot-password-resend-email',
      component: ForgotPasswordResendEmailView,
      meta: { fullWidth: true },
    },
    {
      path: '/password-reset-success',
      name: 'password-reset-success',
      component: PasswordRestSuccessView,
      meta: { fullWidth: true },
    },
    {
      path: '/set-new-password',
      name: 'set-new-password',
      component: SetNewPassword,
      meta: { fullWidth: true },
    },
    {
      path: '/create-new-password',
      name: 'create-new-password',
      component: CreateNewPasswordView,
      meta: { fullWidth: true },
    },
    {
      path: '/reset-new-password',
      name: 'reset-new-password',
      component: ResetNewPasswordView,
      meta: { fullWidth: true },
    },
  ],
})

export default router

<script lang="ts" setup>
import MainButton from '@/components/MainButton.vue';
import { useUserStore } from '@/store/user';

const store = useUserStore();
const admin = store.client.userDetails;
// Verifica se admin è di tipo 'Admin' e ha la proprietà 'hasFullPrivileges'
const privilege = admin && 'hasFullPrivileges' in admin ? admin.hasFullPrivileges : false;

</script>

<template>
    <div class="d-flex flex-column">
        <h2 class="mx-auto mb-5">Hello {{ admin?.firstName }}!</h2>
    </div>
    <section class="d-flex flex-column mt-4">
        <h3 class="mx-auto">Courses</h3>
        <MainButton :path="'/admin/createCourse'">Create course</MainButton>
        <MainButton :path="'/admin/listCourses'">View courses</MainButton>
    </section>
    <section class="d-flex flex-column mt-4">
        <h3 class="mx-auto">One-on-ones</h3>
        <MainButton :path="'/admin/listOneOnOnes'">View One-on-ones</MainButton>
    </section>
    <section class="d-flex flex-column mt-4">
        <h3 class="mx-auto">Users</h3>
        <MainButton :path="'/admin/createClient'">Create user</MainButton>
        <MainButton :path="'/admin/listCustomers'">View users</MainButton>
    </section>
    <section class="d-flex flex-column mt-4">
        <h3 class="mx-auto">Trainers</h3>
        <MainButton :path="'/admin/createTrainer'">Create trainer</MainButton>
        <MainButton :path="'/admin/listTrainers'">View trainers</MainButton>
    </section>
    <section v-if="privilege" class="d-flex flex-column mt-4">
        <h3 class="mx-auto">Admins</h3>
        <MainButton :path="'/admin/createAdmin'">Create admin</MainButton>
        <MainButton :path="'/admin/listAdmins'">View admins</MainButton>
    </section>
</template>
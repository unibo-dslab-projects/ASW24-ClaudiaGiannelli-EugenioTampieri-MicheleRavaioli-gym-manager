<script lang="ts" setup>
import { useUserStore } from '@/store/user';
import Dropdown from '@/components/Dropdown.vue';
import DropdownItem from '@/components/DropdownItem.vue';
import NameLink from '@/components/NameLink.vue';
import MainButton from '@/components/MainButton.vue';
import { BookCourseRequest, CourseInfo, SessionInfo, Trainer } from '@gym-manager/models';
import { ref } from 'vue';
import { useModalsStore } from '@/store/modals';
import SectionContainer from '@/components/SectionContainer.vue';
import SectionContainerItem from '@/components/SectionContainerItem.vue';
import { useNotificationsStore } from '@/store/notifications';
import ChatButton from '@/components/ChatButton.vue';

const store = useUserStore();
const confirm = useModalsStore().confirm;
const notification = useNotificationsStore();

const user = store.client.userDetails;
const myCourses = ref<Array<{ course: CourseInfo; dayOfWeek: string; startTime: string; trainer: Trainer }>>();
const myOneOnOne = ref<Array<{ info: SessionInfo, trainer: Trainer }>>();

if (user) {
    store.client.getCustomerCourses(user._id)
        .then(courses => Promise.all(courses.map(c =>
            store.client.getTrainerById(c.course.trainer).then(t => ({ ...c, trainer: t! }))
        )))
        .then(courses => myCourses.value = courses);
    store.client.getCustomerSessions(user._id)
        .then(sessions => myOneOnOne.value = sessions);
}

async function unsubscribeFromCourse(courseId: string, courseName: string, dayOfWeek: string, startTime: string) {
    if (await confirm('Do you want to unsubscribe from ' + courseName + '?')) {
        const req: BookCourseRequest = { clientId: user!._id, dayOfWeek, startTime }
        store.client.unsubscribeFromCourse(courseId, req)
            .then(res => {
                if (res) {
                    // removed
                    myCourses.value = myCourses.value?.filter(x => !(x.course._id == courseId && x.dayOfWeek == dayOfWeek && x.startTime == startTime))
                    notification.fire({
                        body: 'Unsubscribed from course correctly!',
                        background: 'success'
                    })
                } else {
                    // error
                    notification.fire({
                        body: 'Could not unsubscribe from course',
                        background: 'danger'
                    })
                }
            });
    }
}
async function cancelSession(sessionId: string) {
    if (await confirm('Do you want to cancel the private session?')) {
        store.client.cancelSession(sessionId)
            .then(res => {
                if (res) {
                    // removed
                    myOneOnOne.value = myOneOnOne.value?.filter(x => x.info._id != sessionId)
                    notification.fire({
                        body: 'One-on-one canceled correctly!',
                        background: 'success'
                    })
                } else {
                    // error
                    notification.fire({
                        body: 'Could not cancel one-on-one',
                        background: 'danger'
                    })
                }
            });
    }
}

const bookCourse = '/user/book/course'
const bookOneonOne = '/user/book/session'


</script>

<template>
    <div class="d-flex flex-column">
        <h2 class="mx-auto">Hello {{ user?.firstName }}!</h2>
        <MainButton :path="bookCourse">Book course</MainButton>
        <MainButton :path="bookOneonOne">Book one-on-one</MainButton>
    </div>
    <SectionContainer>
        <SectionContainerItem id="my-courses">
            <h3>My Courses</h3>
            <Dropdown id="my-courses-dropdown">
                <DropdownItem v-for="(course, i) in myCourses" :key="i"
                    :header="[course.dayOfWeek + ' ' + course.startTime, course.course.name]" :id-prefix="'course'"
                    :index="i" :dropdown-id="'my-courses-dropdown'">
                    <dl>
                        <dt>{{ course.course.name }}</dt>
                        <dd>{{ course.course.description }}</dd>
                        <dt>Trainer</dt>
                        <dd>
                            <NameLink :path="store.client.trainerProfilePath(course.course.trainer)">{{
                                course.trainer.firstName + ' ' + course.trainer.lastName }}</NameLink>
                        </dd>
                    </dl>
                    <button type="button" class="btn btn-primary m-2"
                        @click="() => unsubscribeFromCourse(course.course._id, course.course.name, course.dayOfWeek, course.startTime)">Unsubscribe</button>
                </DropdownItem>
            </Dropdown>
            <p v-if="!(myCourses ?? []).length" class="py-5 px-3 text-muted text-center text-lg-start">You haven't signed up for any course yet</p>
        </SectionContainerItem>
        <SectionContainerItem id="my-one-on-one">
            <h3>My One-on-one</h3>
            <Dropdown id="my-oo-dropdown">
                <DropdownItem v-for="(session, i) in myOneOnOne" :key="i"
                    :header="[session.info.dayOfWeek + ' ' + session.info.startTime, session.trainer.firstName + ' ' + session.trainer.lastName]"
                    :id-prefix="'one-on-one'" :index="i" :dropdown-id="'my-oo-dropdown'">
                    <dl>
                        <dt>Trainer</dt>
                        <dd>
                            <NameLink :path="store.client.trainerProfilePath(session.trainer._id)">{{
                                session.trainer.firstName + ' ' + session.trainer.lastName }}</NameLink>
                        </dd>
                    </dl>
                    <button type="button" class="btn btn-primary m-2"
                        @click="() => cancelSession(session.info._id)">Cancel appointment</button>
                </DropdownItem>
            </Dropdown>
            <p v-if="!(myOneOnOne ?? []).length" class="py-5 px-3 text-muted text-center text-lg-start">You haven't signed up for any one-on-one yet</p>
        </SectionContainerItem>
    </SectionContainer>
    <ChatButton v-if="!store.client.isImpersonating" class="mt-5" :use-variant="true">Need help?</ChatButton>
</template>
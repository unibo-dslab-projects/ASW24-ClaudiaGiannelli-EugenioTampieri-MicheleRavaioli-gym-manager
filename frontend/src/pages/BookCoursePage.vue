<script lang="ts" setup>
import { useUserStore } from '@/store/user';
import Dropdown from '@/components/Dropdown.vue';
import DropdownItem from '@/components/DropdownItem.vue';
import NameLink from '@/components/NameLink.vue';
import { Course, CourseInfo, Trainer } from '@gym-manager/models';
import { ref } from 'vue';
import CourseSchedule from '@/components/CourseSchedule.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import SectionContainerItem from '@/components/SectionContainerItem.vue';
import CourseAvailabilityWatcher, { CourseAvailabilityUpdate } from '@/components/CourseAvailabilityWatcher.vue';

const store = useUserStore();

const user = store.client.userDetails;

const myCourses = ref<{ course: CourseInfo; dayOfWeek: string; startTime: string; }[]>();
const allCourses = ref<{ course: Course; trainer: Trainer }[]>();

// get all courses and trainers
store.client.listCourses()
    .then(courses => Promise.all(courses.map(c =>
        store.client.getTrainerById(c.trainer)
            .then(t => ({ course: c, trainer: t! }))
    ))
    ).then(d => allCourses.value = d);

//get user courses
if (user) {
    store.client.getCustomerCourses(user._id)
        .then(courses => myCourses.value = courses);
}

function isAlreadyBooked(courseId: string, dayOfWeek: string, startTime: string): boolean {
    const result = undefined != myCourses.value?.find(e => e.course._id == courseId && e.dayOfWeek == dayOfWeek && e.startTime == startTime);
    return result;
}

function handlePush(update: CourseAvailabilityUpdate) {
    const courseIndex = allCourses.value?.findIndex((x) => x.course._id === update.course);
    if (courseIndex !== -1 && courseIndex !== undefined) {
        const scheduleIndex = allCourses.value![courseIndex].course.schedule.findIndex(x => x.dayOfWeek == update.dayOfWeek && x.startTime == update.startTime);
        if (scheduleIndex !== -1) {
            allCourses.value![courseIndex].course.schedule[scheduleIndex].availableSpots! += update.availability;
        }
    }
}

</script>

<template>
    <SectionContainer>
        <SectionContainerItem id="my-courses">
            <h2>All courses</h2>
            <Dropdown id="my-courses-dropdown">
                <DropdownItem v-for="(course, i) in allCourses" :key="i"
                    :header="[`${course.course.name} (${course.trainer.firstName} ${course.trainer.lastName})`]"
                    :id-prefix="'course'" :index="i" :dropdown-id="'my-courses-dropdown'">
                    <dl>
                        <dt>{{ course.course.name }}</dt>
                        <dd>{{ course.course.description }}</dd>
                        <dt>Trainer</dt>
                        <dd>
                            <NameLink :path="store.client.trainerProfilePath(course.course.trainer)">{{
                                course.trainer.firstName + ' ' + course.trainer.lastName }}</NameLink>
                        </dd>
                        <dt>Date & Time</dt>
                        <dd class="container">
                            <CourseSchedule v-for="schedule in course.course.schedule" :course-id="course.course._id"
                                :schedule="schedule"
                                :booked="isAlreadyBooked(course.course._id, schedule.dayOfWeek, schedule.startTime)" />
                        </dd>
                    </dl>
                </DropdownItem>
            </Dropdown>
        </SectionContainerItem>
    </SectionContainer>
    <CourseAvailabilityWatcher @update="handlePush"></CourseAvailabilityWatcher>
</template>

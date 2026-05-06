import { api } from "./api";
import type { Course } from "../types/course";

type CoursesResponse = {
  courses: Course[];
};

type CourseResponse = {
  course: Course;
};

export type CreateCourseData = {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type UpdateCourseData = Partial<CreateCourseData>;

export async function listCourses() {
  const response = await api.get<CoursesResponse>("/courses");

  return response.data.courses;
}

export async function getCourse(id: string) {
  const response = await api.get<CourseResponse>(`/courses/${id}`);

  return response.data.course;
}

export async function createCourse(data: CreateCourseData) {
  const response = await api.post<CourseResponse>("/courses", data);

  return response.data.course;
}

export async function updateCourse(id: string, data: UpdateCourseData) {
  const response = await api.patch<CourseResponse>(`/courses/${id}`, data);

  return response.data.course;
}

export async function deleteCourse(id: string) {
  await api.delete(`/courses/${id}`);
}

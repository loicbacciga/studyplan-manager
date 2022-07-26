import React, { useEffect } from "react";
import { Heading, HStack, IconButton, Stack, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { toastErrorOptions, toastSuccessOptions } from "../../lib/chakraUtils";
import { AddCourseButton } from "./CoursesListEntry";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useCategoriesData } from "../../lib/firestore/categories";
import { useCourses } from "../../lib/firestore/courses";
import { useSeasons } from "../../lib/firestore/seasons";
import CoursesCategoryList from "./CoursesCategoryList";
import { useProgramme } from "../../lib/firestore/programmes";

export type UpdateCourse = (courseId: string) => (
  school_course_id: string, name: string, link: string, credits: number, season_id: string, category_id: string,
  subcategory_id?: string, major_id?: string, minor_id?: string
) => void;

export type RemoveCourse = (courseId: string) => () => void

interface CoursesListProps {
  programmeId: string,
  coursesIdsToShow?: string[],  // Used to only show some courses
  takenCoursesData?: TakenCourseData[],   // Used to take/untake courses
  onCheck?: (courseId: string, checked: boolean) => void,
  noBorder?: boolean,
  onEdit?: (courseId: string) => void,
  showMinorId?: string,
  showMajorId?: string
}

const CoursesList = (props: CoursesListProps) => {
  const {
    programmeId, coursesIdsToShow, takenCoursesData, onCheck, noBorder, onEdit, showMinorId, showMajorId
  } = props;
  const { isOpen, onToggle, onOpen } = useDisclosure();

  const { courses, add, update, remove } = useCourses(programmeId);
  const { categoriesData } = useCategoriesData(programmeId);
  const { seasons } = useSeasons(programmeId);
  const { programme } = useProgramme(programmeId);

  const takenCourses = (takenCoursesData && courses) ? courses.filter(c => takenCoursesData.some(d => d.course_id === c.id)) : [];
  // @ts-ignore
  const takenCredits = takenCourses.map(c => Number.parseInt(c.credits)).reduce((acc, curVal) => acc + curVal, 0);


  useEffect(() => {
    if (noBorder) {
      onOpen();
    }
  }, [noBorder]);

  const toast = useToast();

  const addCourse = (
    school_course_id: string, name: string, link: string, credits: number, season_id: string, category_id: string,
    subcategory_id?: string, major_id?: string, minor_id?: string
  ) => {
    add({ school_course_id, name, link, credits, season_id, category_id, subcategory_id, major_id, minor_id })
      .then(() => toast(toastSuccessOptions("Successfully added course")))
      .catch(() => toast(toastErrorOptions("Failed to add major")));
  }

  const updateCourse = (courseId: string) => (
    school_course_id: string, name: string, link: string, credits: number, season_id: string, category_id: string,
    subcategory_id?: string, major_id?: string, minor_id?: string
  ) => {
    update({
      id: courseId, school_course_id, name, link, credits, season_id, category_id, subcategory_id, major_id, minor_id
    })
      .then(() => toast(toastSuccessOptions("Successfully edited course")))
      .catch(() => toast(toastErrorOptions("Failed to edit course")));
  }

  const removeCourse = (courseId: string) => () => {
    remove(courseId)
      .then(() => toast(toastSuccessOptions("Successfully removed course")))
      .catch(() => toast(toastErrorOptions("Failed to remove course")));
  }


  const Body = (
    <>
      {(courses && courses.length === 0) && <Text color="gray">No courses yet</Text>}
      <Stack>
        {courses && (
          <CoursesCategoryList
            programmeId={programmeId}
            courses={courses}
            updateCourse={updateCourse}
            removeCourse={removeCourse}
            coursesIdsToShow={coursesIdsToShow}
            takenCoursesData={takenCoursesData}
            onCheck={onCheck}
            onEdit={onEdit}
            showMajorId={showMajorId}
            showMinorId={showMinorId}
          />
        )}
      </Stack>

      {(categoriesData && seasons && !noBorder) && (
        <AddCourseButton programmeId={programmeId} addCourse={addCourse}/>
      )}
    </>
  )

  const bgColor = () => {
    if (takenCoursesData && programme) {
      if (takenCredits < programme.min_credits) return "red.200";
      else return "green.200";
    } else {
      return undefined;
    }
  }

  return (
    <Stack
      borderWidth={noBorder ? undefined : "1px"}
      borderRadius={noBorder ? undefined : "md"}
      py={noBorder ? undefined : { base: 1, lg: 2 }}
      pb={noBorder ? undefined : { base: 1, lg: 2 }}
      px={noBorder ? undefined : { base: 2, lg: 4 }}
      w="100%"
    >
      <HStack justify="space-between" bgColor={bgColor()}>
        <Heading size="md" mb={{ base: 0, lg: 2 }}>
          {(noBorder && programme) ? programme.name : "Courses"}
        </Heading>

        {(noBorder && programme) ? (
          <Heading size="md">Taken {takenCredits}/{programme.min_credits} credits</Heading>
        ) : (
          <IconButton
            variant="ghost"
            aria-label="Open menu"
            icon={isOpen ? <FiChevronUp/> : <FiChevronDown fontSize="1.25rem"/>}
            onClick={onToggle}
          />
        )}
      </HStack>

      {isOpen && Body}
    </Stack>
  )
}

export default CoursesList;
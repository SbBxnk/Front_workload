export interface DropdownPrefix {
  prefix_id: number
  prefix_name: string
}

export interface DropdownPosition {
  position_id: number
  position_name: string
  position_short_name?: string
}

export interface DropdownExPosition {
  ex_position_id: number
  ex_position_name: string
}

export interface DropdownBranch {
  branch_id: number
  branch_name: string
}

export interface DropdownCourse {
  course_id: number
  course_name: string
}

export interface DropdownPersonalType {
  type_p_id: number
  type_p_name: string
}

export interface DropdownUserLevel {
  level_id: number
  level_name: string
}

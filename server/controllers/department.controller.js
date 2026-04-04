import Department from "../models/department.model.js";

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isDeleted: false }).populate(
      "head",
      "name",
    );
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const departmentExists = await Department.findOne({
      name,
      isDeleted: false,
    });

    if (departmentExists) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      name,
      description,
      image,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, image, head } = req.body;

    const department = await Department.findById(req.params.id);

    if (department) {
      department.name = name || department.name;
      department.description = description || department.description;
      department.image = image || department.image;
      department.head = head || department.head;

      const updatedDepartment = await department.save();
      res.json(updatedDepartment);
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a department (Soft delete)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      department.isDeleted = true;
      await department.save();
      res.json({ message: "Department removed" });
    } else {
      res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

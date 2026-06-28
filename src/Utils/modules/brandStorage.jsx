import _isEmpty from 'lodash/isEmpty';
import CacheManager from 'Utils/cacheManager';
import { encryptWithAES, getUserDetails } from './crypto';

function findByProp(collection, key, value) {
    if (!Array.isArray(collection)) return undefined;
    return collection.find((item) => item?.[key] === value);
}

export function updateBrandId(name, id, departmentId, attributeName) {
    let tmpData = getUserDetails();
    if (tmpData.departmentList?.length === 0 && (tmpData.licenseTypeId != '3' || tmpData.licenseTypeId != 3)) {
        tmpData.departmentList = [
            {
                departmentId,
                departmentName: '',
                brandId: id,
                brandName: attributeName,
                uiprintableName: name,
            },
        ];
    } else {
        tmpData.departmentList = tmpData.departmentList.map((res) => {
            if (res.departmentId === departmentId)
                return {
                    ...res,
                    brandId: id,
                    brandName: attributeName,
                    uiprintableName: name,
                };
            return res;
        });
    }

    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(tmpData)));
    CacheManager.set('userDetails', tmpData);
}
export function updateDepartmentList(departments) {
    let tmpData = getUserDetails();
    tmpData.departmentList = departments;
    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(tmpData)));
    CacheManager.set('userDetails', tmpData);
}

export function checkIsBrandExists(departmentId) {
    const { departmentList } = getUserDetails();
    const selectedDepartment = findByProp(departmentList, 'departmentId', departmentId);
    if (
        _isEmpty(selectedDepartment) ||
        !Boolean(selectedDepartment) ||
        !!!selectedDepartment?.brandName ||
        selectedDepartment?.brandName?.trim() === ''
    ) {
        return true;
    }
    return false;
}
export function getBrandName(departmentId) {
    const { departmentList } = getUserDetails();
    const selectedDepartment = findByProp(departmentList, 'departmentId', departmentId);
    return selectedDepartment?.brandName || '';
}
export function getBrandNameUIPrintable(departmentId) {
    const { departmentList } = getUserDetails();
    const selectedDepartment = findByProp(departmentList, 'departmentId', departmentId);
    // return selectedDepartment?.brandName || '';
    return selectedDepartment?.uiprintableName || '';
}
